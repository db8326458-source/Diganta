import * as THREE from 'three';
import { VehicleType } from '../types/game';

export class Vehicle3D {
  public group: THREE.Group;
  public type: VehicleType;
  public wheels: THREE.Mesh[] = [];
  public headlight: THREE.SpotLight | null = null;
  public speed: number = 0;
  public steerAngle: number = 0;
  public maxSpeed: number = 16;
  public acceleration: number = 10;
  public turnSpeed: number = 2.4;

  constructor(type: VehicleType, initialPosition: THREE.Vector3) {
    this.type = type;
    this.group = new THREE.Group();
    this.group.position.copy(initialPosition);

    switch (type) {
      case 'bicycle':
        this.maxSpeed = 8;
        this.acceleration = 6;
        this.buildBicycle();
        break;
      case 'scooter':
        this.maxSpeed = 14;
        this.acceleration = 9;
        this.buildScooter();
        break;
      case 'car':
        this.maxSpeed = 22;
        this.acceleration = 12;
        this.buildCar();
        break;
      case 'motorcycle':
      default:
        this.maxSpeed = 18;
        this.acceleration = 12;
        this.buildMotorcycle();
        break;
    }

    this.setupHeadlight();
  }

  private buildMotorcycle() {
    // 100cc Indian Commuter Bike (Desi Splendor)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.6, roughness: 0.2 }); // Deep Indian Red
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.95, roughness: 0.1 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });

    // Fuel Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.9), tankMat);
    tank.position.set(0, 0.95, -0.2);
    tank.castShadow = true;
    this.group.add(tank);

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.95), seatMat);
    seat.position.set(0, 0.9, 0.5);
    seat.castShadow = true;
    this.group.add(seat);

    // Engine block
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.5), chromeMat);
    engine.position.set(0, 0.45, 0);
    this.group.add(engine);

    // Chrome Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8), chromeMat);
    exhaust.rotateX(Math.PI / 2);
    exhaust.position.set(0.28, 0.3, 0.4);
    this.group.add(exhaust);

    // Wheels (Front & Rear)
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    frontWheel.position.set(0, 0.36, -1.05);
    frontWheel.castShadow = true;
    this.group.add(frontWheel);
    this.wheels.push(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rearWheel.position.set(0, 0.36, 1.05);
    rearWheel.castShadow = true;
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);

    // Handlebars
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.06), chromeMat);
    handleBar.position.set(0, 1.15, -0.75);
    this.group.add(handleBar);
  }

  private buildScooter() {
    // Chetak / Activa style Scooter
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 }); // Sky Blue
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 });

    // Front Apron
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.25), bodyMat);
    apron.position.set(0, 0.8, -0.7);
    apron.castShadow = true;
    this.group.add(apron);

    // Flat Footboard
    const floor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.7), floorMat);
    floor.position.set(0, 0.3, -0.2);
    this.group.add(floor);

    // Rear Engine Cowl & Seat
    const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.9), bodyMat);
    cowl.position.set(0, 0.65, 0.5);
    cowl.castShadow = true;
    this.group.add(cowl);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 14);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    frontWheel.position.set(0, 0.28, -0.85);
    this.group.add(frontWheel);
    this.wheels.push(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rearWheel.position.set(0, 0.28, 0.75);
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);
  }

  private buildBicycle() {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.7, roughness: 0.4 }); // Green Indian Cycle
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    // Diamond Frame
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), frameMat);
    topBar.rotateX(Math.PI / 2);
    topBar.position.set(0, 0.85, 0);
    this.group.add(topBar);

    // Wheels (Large cycle diameter)
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    frontWheel.position.set(0, 0.42, -0.8);
    this.group.add(frontWheel);
    this.wheels.push(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, rubberMat);
    rearWheel.position.set(0, 0.42, 0.8);
    this.group.add(rearWheel);
    this.wheels.push(rearWheel);

    // Cycle Handlebars & Bell
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.04), chromeMat);
    bar.position.set(0, 1.1, -0.65);
    this.group.add(bar);
  }

  private buildCar() {
    // Desi 800 Indian Hatchback
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.4, roughness: 0.4 }); // Classic White
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.6 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    // Lower Chassis
    const lower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 3.6), bodyMat);
    lower.position.set(0, 0.55, 0);
    lower.castShadow = true;
    this.group.add(lower);

    // Cabin / Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 2.0), glassMat);
    cabin.position.set(0, 1.15, 0.2);
    cabin.castShadow = true;
    this.group.add(cabin);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    for (let x of [-0.95, 0.95]) {
      for (let z of [-1.15, 1.15]) {
        const wheel = new THREE.Mesh(wheelGeo, rubberMat);
        wheel.position.set(x, 0.32, z);
        wheel.castShadow = true;
        this.group.add(wheel);
        this.wheels.push(wheel);
      }
    }
  }

  private setupHeadlight() {
    this.headlight = new THREE.SpotLight(0xfffae6, 0.1, 35, Math.PI / 4, 0.3, 1.5);
    this.headlight.position.set(0, 0.9, -1.2);
    const target = new THREE.Object3D();
    target.position.set(0, 0.2, -15);
    this.group.add(target);
    this.headlight.target = target;
    this.group.add(this.headlight);
  }

  public updateDriving(throttle: number, steer: number, delta: number) {
    // Throttle: -1 (reverse) to 1 (forward)
    if (throttle !== 0) {
      this.speed += throttle * this.acceleration * delta;
      this.speed = THREE.MathUtils.clamp(this.speed, -this.maxSpeed * 0.4, this.maxSpeed);
    } else {
      // Natural rolling friction
      this.speed = THREE.MathUtils.damp(this.speed, 0, 4.0, delta);
    }

    // Steering
    if (Math.abs(this.speed) > 0.1) {
      const turnDir = this.speed >= 0 ? steer : -steer;
      this.group.rotation.y += turnDir * this.turnSpeed * delta;
    }

    // Velocity projection
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
    this.group.position.addScaledVector(forward, this.speed * delta);

    // Keep on ground
    this.group.position.y = 0;

    // Wheel rotation
    const wheelRot = (this.speed / 0.35) * delta;
    this.wheels.forEach(w => {
      w.rotation.x -= wheelRot;
    });
  }

  public setLights(isNight: boolean) {
    if (this.headlight) {
      this.headlight.intensity = isNight ? 2.5 : 0.0;
    }
  }
}
