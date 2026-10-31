import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GameLocation, PlayerCustomization, VehicleType } from '../types/game';
import { VillageMap } from './VillageMap';
import { Character3D } from './Character3D';
import { Vehicle3D } from './Vehicle3D';
import { sound } from '../audio/soundEngine';

export class GameWorld {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public villageMap: VillageMap;
  public playerChar: Character3D;
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public playerYaw: number = 0;
  public isDriving: boolean = false;
  public activeVehicle: Vehicle3D | null = null;
  public vehicles: Vehicle3D[] = [];

  // Lights & Environment
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  private waypointBeam: THREE.Mesh;

  // Camera Orbit & Chase
  public camYaw: number = 0;
  public camPitch: number = 0.25;
  public camDist: number = 5.5;
  private targetCamPos: THREE.Vector3 = new THREE.Vector3();

  // Timing & Software GL
  private clock: THREE.Clock = new THREE.Clock();
  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;

  // Callbacks
  public onNearbyInteractable: ((interactable: { id: string; name: string } | null) => void) | null = null;
  public onVehicleNearby: ((vehicleType: VehicleType | null) => void) | null = null;

  constructor(container: HTMLElement, customization: PlayerCustomization) {
    this.container = container;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.007);

    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      500
    );

    // Modern Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Studio Environment map
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    this.sunLight.position.set(50, 80, 40);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 250;
    const d = 80;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Village Map
    this.villageMap = new VillageMap();
    this.scene.add(this.villageMap.group);

    // Player Character
    this.playerChar = new Character3D(customization);
    this.playerPos.set(0, 0, -2);
    this.playerChar.group.position.copy(this.playerPos);
    this.scene.add(this.playerChar.group);

    // Spawn Indian Vehicles in village
    const bike = new Vehicle3D('motorcycle', new THREE.Vector3(4, 0, -5));
    const scooter = new Vehicle3D('scooter', new THREE.Vector3(-4, 0, -6));
    const cycle = new Vehicle3D('bicycle', new THREE.Vector3(2, 0, -12));
    const car = new Vehicle3D('car', new THREE.Vector3(8, 0, -3));

    this.vehicles = [bike, scooter, cycle, car];
    this.vehicles.forEach(v => this.scene.add(v.group));

    // Waypoint Guide Beam (Beacon of Light)
    const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 50, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.waypointBeam = new THREE.Mesh(beamGeo, beamMat);
    this.waypointBeam.position.set(0, 25, -15);
    this.scene.add(this.waypointBeam);

    // Setup Rain Particles
    this.setupRain();

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start Loop
    this.startLoop();
  }

  private setupRain() {
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.65
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public setWaypoint(loc: GameLocation | null) {
    if (!loc) {
      this.waypointBeam.visible = false;
      return;
    }
    this.waypointBeam.visible = true;
    this.waypointBeam.position.set(loc.x, 25, loc.z);
  }

  public updateTimeAndWeather(inGameMinutes: number, weather: 'clear' | 'rainy') {
    // 0 to 1440 minutes in 24 hours
    const dayProgress = inGameMinutes / 1440; // 0 to 1
    const sunAngle = dayProgress * Math.PI * 2 - Math.PI / 2;

    const sunX = Math.cos(sunAngle) * 90;
    const sunY = Math.sin(sunAngle) * 90;
    const isNight = sunY < -5;

    this.sunLight.position.set(sunX, Math.max(sunY, -30), 40);

    // Dynamic sky & fog coloring
    if (isNight) {
      // Starry Indian Night
      const nightCol = new THREE.Color(0x060b18);
      this.scene.background = nightCol;
      if (this.scene.fog) this.scene.fog.color = nightCol;
      this.sunLight.intensity = 0.05;
      this.hemiLight.intensity = 0.25;
      this.villageMap.updateLights(true);
      this.vehicles.forEach(v => v.setLights(true));
    } else if (sunY < 18) {
      // Golden Hour / Sunset / Dawn
      const duskCol = new THREE.Color(0xd97736);
      this.scene.background = duskCol;
      if (this.scene.fog) this.scene.fog.color = duskCol;
      this.sunLight.color.set(0xff7733);
      this.sunLight.intensity = 1.3;
      this.hemiLight.intensity = 0.6;
      this.villageMap.updateLights(false);
      this.vehicles.forEach(v => v.setLights(false));
    } else {
      // Bright Sunny Day
      const dayCol = weather === 'rainy' ? new THREE.Color(0x475569) : new THREE.Color(0x87ceeb);
      this.scene.background = dayCol;
      if (this.scene.fog) this.scene.fog.color = dayCol;
      this.sunLight.color.set(0xfffaed);
      this.sunLight.intensity = weather === 'rainy' ? 0.9 : 1.8;
      this.hemiLight.intensity = 0.9;
      this.villageMap.updateLights(false);
      this.vehicles.forEach(v => v.setLights(false));
    }

    if (this.rainParticles) {
      this.rainParticles.visible = weather === 'rainy';
    }
  }

  public updatePlayerMovement(
    inputVec: { x: number; y: number },
    sprint: boolean,
    jumpPressed: boolean,
    delta: number
  ) {
    if (this.isDriving && this.activeVehicle) {
      // Driving Controls: inputVec.y = throttle, inputVec.x = steer
      this.activeVehicle.updateDriving(-inputVec.y, -inputVec.x, delta);
      sound.updateEngineSound(true, Math.abs(this.activeVehicle.speed) / this.activeVehicle.maxSpeed);

      // Player follows vehicle
      this.playerPos.copy(this.activeVehicle.group.position);
      this.playerYaw = this.activeVehicle.group.rotation.y;
      this.playerChar.group.position.copy(this.playerPos);
      this.playerChar.group.rotation.y = this.playerYaw;
      this.playerChar.updateAnimation(Math.abs(this.activeVehicle.speed), delta, true);
    } else {
      sound.updateEngineSound(false, 0);

      // Pedestrian Walking / Running Controls
      const speed = sprint ? 8.5 : 4.5;
      const inputLen = Math.hypot(inputVec.x, inputVec.y);

      if (inputLen > 0.1) {
        // Compute movement direction relative to camera yaw
        const moveAngle = Math.atan2(inputVec.x, -inputVec.y) + this.camYaw;
        const forward = new THREE.Vector3(Math.sin(moveAngle), 0, Math.cos(moveAngle));

        this.playerPos.addScaledVector(forward, speed * delta);
        this.playerYaw = THREE.MathUtils.damp(this.playerYaw, moveAngle, 12, delta);

        if (Math.random() < 0.12) {
          sound.playFootstep();
        }
      }

      // Constrain inside village boundary (radius ~130)
      const dist = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (dist > 135) {
        this.playerPos.setLength(135);
      }

      this.playerChar.group.position.copy(this.playerPos);
      this.playerChar.group.rotation.y = this.playerYaw;
      this.playerChar.updateAnimation(inputLen * (sprint ? 2.0 : 1.0), delta, false);
    }

    // Check nearby interactable location
    this.checkInteractions();
  }

  private checkInteractions() {
    let nearestLoc: { id: string; name: string } | null = null;
    let minDist = Infinity;

    for (const item of this.villageMap.interactables) {
      const d = this.playerPos.distanceTo(item.position);
      if (d <= item.radius && d < minDist) {
        minDist = d;
        nearestLoc = { id: item.id, name: item.name };
      }
    }
    this.onNearbyInteractable?.(nearestLoc);

    // Check nearby vehicle
    if (!this.isDriving) {
      let nearestVeh: Vehicle3D | null = null;
      let minVehDist = 3.5;
      for (const v of this.vehicles) {
        const d = this.playerPos.distanceTo(v.group.position);
        if (d < minVehDist) {
          minVehDist = d;
          nearestVeh = v;
        }
      }
      this.onVehicleNearby?.(nearestVeh ? nearestVeh.type : null);
    } else {
      this.onVehicleNearby?.(this.activeVehicle ? this.activeVehicle.type : null);
    }
  }

  public toggleDrive(targetType?: VehicleType) {
    if (this.isDriving) {
      // Exit Vehicle
      this.isDriving = false;
      if (this.activeVehicle) {
        this.playerPos.copy(this.activeVehicle.group.position).add(new THREE.Vector3(1.2, 0, 0));
        this.playerChar.group.position.copy(this.playerPos);
      }
      this.activeVehicle = null;
      sound.updateEngineSound(false, 0);
    } else {
      // Find nearest vehicle or specific type
      let nearestVeh = this.vehicles[0];
      let minDist = Infinity;
      for (const v of this.vehicles) {
        if (!targetType || v.type === targetType) {
          const d = this.playerPos.distanceTo(v.group.position);
          if (d < minDist) {
            minDist = d;
            nearestVeh = v;
          }
        }
      }
      if (nearestVeh && minDist < 6.0) {
        this.isDriving = true;
        this.activeVehicle = nearestVeh;
        sound.playHorn(nearestVeh.type === 'scooter' ? 'scooter' : nearestVeh.type === 'car' ? 'car' : 'bike');
      }
    }
  }

  public honk() {
    if (this.activeVehicle) {
      sound.playHorn(this.activeVehicle.type === 'scooter' ? 'scooter' : this.activeVehicle.type === 'car' ? 'car' : 'bike');
    }
  }

  private updateCamera(delta: number) {
    // Third-person camera tracking with exponential smoothing
    const targetHeight = this.isDriving ? 1.6 : 1.5;
    const followDist = this.isDriving ? this.camDist * 1.3 : this.camDist;

    const lookTarget = new THREE.Vector3(
      this.playerPos.x,
      this.playerPos.y + targetHeight,
      this.playerPos.z
    );

    const cx = lookTarget.x + followDist * Math.sin(this.camYaw) * Math.cos(this.camPitch);
    const cz = lookTarget.z + followDist * Math.cos(this.camYaw) * Math.cos(this.camPitch);
    const cy = Math.max(lookTarget.y + followDist * Math.sin(this.camPitch), 0.6);

    this.targetCamPos.set(cx, cy, cz);
    this.camera.position.lerp(this.targetCamPos, Math.min(delta * 12.0, 1.0));
    this.camera.lookAt(lookTarget);
  }

  private updateRain(delta: number) {
    if (!this.rainParticles || !this.rainParticles.visible) return;
    const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= delta * 45;
      if (positions[i] < 0) {
        positions[i] = 50;
      }
    }
    this.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDestroyed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.animFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.animFrameId = window.setTimeout(cb, 80);
        }
      };
      this.animFrameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.isDestroyed) return;
      const delta = Math.min(this.clock.getDelta(), 0.1);

      this.updateCamera(delta);
      this.updateRain(delta);

      // Waypoint beam gentle pulsing
      if (this.waypointBeam.visible) {
        this.waypointBeam.rotation.y += delta * 0.8;
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.animFrameId);
    clearTimeout(this.animFrameId);
    this.renderer.dispose();
  }
}
