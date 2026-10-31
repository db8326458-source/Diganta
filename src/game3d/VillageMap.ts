import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generator for Signboards
 */
function createSignboardTexture(title: string, subtitle: string, bgColor: string, textColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, canvas.width / 2, 60);

  ctx.font = '22px sans-serif';
  ctx.fillText(subtitle, canvas.width / 2, 115);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class VillageMap {
  public group: THREE.Group;
  public colliders: THREE.Box3[] = [];
  public interactables: { id: string; name: string; position: THREE.Vector3; radius: number }[] = [];
  public streetLights: THREE.PointLight[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildTerrain();
    this.buildRiverAndBridge();
    this.buildTeaGardens();
    this.buildRoadNetwork();
    this.buildMiddleClassHome();
    this.buildSchool();
    this.buildCyberCafe();
    this.buildBankAndATM();
    this.buildMarket();
    this.buildPoliceStation();
    this.buildHospital();
    this.buildRailwayStation();
    this.buildPlayground();
    this.buildVegetation();
  }

  private buildTerrain() {
    // Large ground terrain with gentle green-tinted Assam landscape
    const groundGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3d6e35,
      roughness: 0.88,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.group.add(ground);
  }

  private buildRiverAndBridge() {
    // Brahmaputra Tributary River cutting across the eastern sector
    const riverGeo = new THREE.PlaneGeometry(350, 40);
    riverGeo.rotateX(-Math.PI / 2);
    riverGeo.rotateY(-Math.PI / 8);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x1d4e68,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(85, -0.02, 0);
    this.group.add(river);

    // River Bridge (Concrete Piers & Steel Trusses)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(85, 0, 0);

    // Bridge deck
    const deckGeo = new THREE.BoxGeometry(16, 0.8, 48);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x555b62, roughness: 0.7 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 1.2, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Piers
    const pierGeo = new THREE.CylinderGeometry(1.2, 1.2, 6, 12);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.9 });
    for (let pz of [-16, 0, 16]) {
      const pier = new THREE.Mesh(pierGeo, pierMat);
      pier.position.set(0, -1.5, pz);
      bridgeGroup.add(pier);
    }

    // Railings
    const railMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
    const railGeo = new THREE.BoxGeometry(0.3, 1.2, 48);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-7.5, 2.0, 0);
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(7.5, 2.0, 0);
    bridgeGroup.add(leftRail);
    bridgeGroup.add(rightRail);

    this.group.add(bridgeGroup);
  }

  private buildTeaGardens() {
    // Neat rows of Assam tea bushes
    const teaGroup = new THREE.Group();
    teaGroup.position.set(-70, 0, -80);

    const bushGeo = new THREE.SphereGeometry(1.4, 8, 8);
    bushGeo.scale(1.2, 0.7, 1.2);
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x286324,
      roughness: 0.9,
      metalness: 0.05
    });

    const rows = 8;
    const cols = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bush = new THREE.Mesh(bushGeo, bushMat);
        bush.position.set(c * 3.8 - (cols * 3.8) / 2, 0.7, r * 4.2 - (rows * 4.2) / 2);
        bush.castShadow = true;
        teaGroup.add(bush);
      }
    }

    // Tea Estate Signboard
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('ASSAM TEA ESTATE', 'Lush Organic Tea Gardens', '#154a1a', '#ffffff')
    });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.2), signMat);
    signMesh.position.set(0, 2.5, 20);
    teaGroup.add(signMesh);

    this.group.add(teaGroup);
    this.interactables.push({
      id: 'tea_garden',
      name: 'Assam Tea Estate',
      position: new THREE.Vector3(-70, 0, -60),
      radius: 12
    });
  }

  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.85 });
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Main East-West Highway
    const mainRoadGeo = new THREE.PlaneGeometry(16, 280);
    mainRoadGeo.rotateX(-Math.PI / 2);
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.position.set(0, 0.01, 0);
    mainRoad.receiveShadow = true;
    this.group.add(mainRoad);

    // North-South Cross Road leading to School and Station
    const crossRoadGeo = new THREE.PlaneGeometry(280, 14);
    crossRoadGeo.rotateX(-Math.PI / 2);
    const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat);
    crossRoad.position.set(0, 0.012, -25);
    crossRoad.receiveShadow = true;
    this.group.add(crossRoad);

    // Road dashed stripes
    for (let z = -130; z < 130; z += 12) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 6), markMat);
      stripe.rotateX(-Math.PI / 2);
      stripe.position.set(0, 0.02, z);
      this.group.add(stripe);
    }

    // Street Lights along main roads
    const lampGeo = new THREE.CylinderGeometry(0.12, 0.16, 7, 8);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe899 });

    for (let z of [-90, -45, 10, 60, 110]) {
      const lamp = new THREE.Group();
      lamp.position.set(9.5, 0, z);

      const pole = new THREE.Mesh(lampGeo, lampMat);
      pole.position.y = 3.5;
      pole.castShadow = true;
      lamp.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.2), lampMat);
      arm.position.set(-1.0, 6.8, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), bulbMat);
      bulb.position.set(-2.0, 6.5, 0);
      lamp.add(bulb);

      const light = new THREE.PointLight(0xffdf80, 0.8, 25);
      light.position.set(-2.0, 6.2, 0);
      lamp.add(light);
      this.streetLights.push(light);

      this.group.add(lamp);
    }
  }

  private buildMiddleClassHome() {
    // Typical Indian Middle Class Assam-Type / Pucca house with boundary wall, courtyard, veranda
    const home = new THREE.Group();
    home.position.set(0, 0, -15);

    // Main House Structure
    const wallGeo = new THREE.BoxGeometry(14, 5, 12);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd9c5a7, roughness: 0.8 }); // Warm ochre paint
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.set(0, 2.5, 0);
    walls.castShadow = true;
    walls.receiveShadow = true;
    home.add(walls);

    // Slanted Tin / Sheet Roof (Distinctive Assam architecture)
    const roofGeo = new THREE.ConeGeometry(12, 3.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x245468, roughness: 0.4, metalness: 0.3 }); // Teal tin roof
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 6.5, 0);
    roof.scale.set(1.15, 0.8, 1.0);
    roof.castShadow = true;
    home.add(roof);

    // Veranda / Porch ("Baranda")
    const porchGeo = new THREE.BoxGeometry(10, 0.4, 4);
    const porchMat = new THREE.MeshStandardMaterial({ color: 0xb5653b, roughness: 0.7 }); // Red terracotta tile
    const porch = new THREE.Mesh(porchGeo, porchMat);
    porch.position.set(0, 0.2, 7.5);
    home.add(porch);

    // Veranda Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    for (let px of [-4.5, 0, 4.5]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 2.25, 9.2);
      p.castShadow = true;
      home.add(p);
    }

    // Door & Nameplate
    const doorGeo = new THREE.BoxGeometry(2, 3.2, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.4 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.8, 6.05);
    home.add(door);

    // Nameplate "Barua Niwas - Apne Sapne"
    const nameplateMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('APNA GHAR (HOME)', 'Barua Parivar • Sweet Home', '#871a1a', '#ffffff')
    });
    const nameplate = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 0.05), nameplateMat);
    nameplate.position.set(0, 3.8, 6.1);
    home.add(nameplate);

    // Boundary Gate
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 13);
    const wallSegMat = new THREE.MeshStandardMaterial({ color: 0xbcab90, roughness: 0.9 });
    const bWall1 = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 0.4), wallSegMat);
    bWall1.position.set(-6, 1, 0);
    const bWall2 = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 0.4), wallSegMat);
    bWall2.position.set(6, 1, 0);
    gateGroup.add(bWall1);
    gateGroup.add(bWall2);

    home.add(gateGroup);
    this.group.add(home);

    this.interactables.push({
      id: 'home',
      name: 'Apna Ghar (Family Home)',
      position: new THREE.Vector3(0, 0, -8),
      radius: 6.5
    });
  }

  private buildSchool() {
    const school = new THREE.Group();
    school.position.set(-45, 0, -40);

    // School Main Two-Story Building
    const buildingGeo = new THREE.BoxGeometry(24, 8, 14);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0xd6e4ff, roughness: 0.7 });
    const bld = new THREE.Mesh(buildingGeo, buildingMat);
    bld.position.set(0, 4, 0);
    bld.castShadow = true;
    bld.receiveShadow = true;
    school.add(bld);

    // Roof
    const roofMesh = new THREE.Mesh(
      new THREE.BoxGeometry(25.5, 0.8, 15.5),
      new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.4 })
    );
    roofMesh.position.set(0, 8.4, 0);
    school.add(roofMesh);

    // Signboard
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('SARASWATI VIDYA NIKETAN', 'Govt. Model School & College', '#1d3557', '#ffffff')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(14, 2.6, 0.2), signMat);
    sign.position.set(0, 7.2, 7.15);
    school.add(sign);

    // Indian National Flagpole in Front Lawn
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d4, metalness: 0.9 })
    );
    pole.position.set(0, 4.5, 12);
    school.add(pole);

    // Tricolor flag (Saffron, White, Green)
    const flagGeo = new THREE.PlaneGeometry(2.2, 1.4);
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xff9933, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(1.1, 8.2, 12);
    school.add(flag);

    this.group.add(school);

    this.interactables.push({
      id: 'school',
      name: 'Saraswati Vidya Niketan (School & College)',
      position: new THREE.Vector3(-45, 0, -30),
      radius: 8.0
    });
  }

  private buildCyberCafe() {
    const cafe = new THREE.Group();
    cafe.position.set(25, 0, -35);

    // Cyber Cafe Shopfront
    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0xf4eee1, roughness: 0.6 })
    );
    bld.position.set(0, 2.5, 0);
    bld.castShadow = true;
    cafe.add(bld);

    // Big Glowing Signboard
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('MAA TARA CYBER POINT', 'Online Exam Forms • Job Apply • Xerox', '#b91c1c', '#ffff00')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(9.6, 2.2, 0.2), signMat);
    sign.position.set(0, 4.6, 4.15);
    cafe.add(sign);

    // Cyber Cafe Computer Desks inside window
    const glowLight = new THREE.PointLight(0x00e5ff, 1.2, 12);
    glowLight.position.set(0, 2.5, 2);
    cafe.add(glowLight);

    this.group.add(cafe);

    this.interactables.push({
      id: 'cyber_cafe',
      name: 'Maa Tara Cyber Point',
      position: new THREE.Vector3(25, 0, -28),
      radius: 6.0
    });
  }

  private buildBankAndATM() {
    const bank = new THREE.Group();
    bank.position.set(42, 0, -10);

    // Bank Main Building
    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(12, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.6 })
    );
    bld.position.set(0, 3, 0);
    bld.castShadow = true;
    bank.add(bld);

    // Signboard
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('STATE GRAMIN BANK', 'Savings • Deposit • Govt Subsidy', '#0284c7', '#ffffff')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(11, 2.2, 0.2), signMat);
    sign.position.set(0, 5.2, 5.15);
    bank.add(sign);

    // Dedicated 24/7 ATM Kiosk right beside Bank
    const atmKiosk = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 3.8, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    atmKiosk.position.set(-8, 1.9, 3);
    bank.add(atmKiosk);

    const atmSignMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('24x7 ATM', 'Instant Cash Withdraw', '#15803d', '#ffffff')
    });
    const atmSign = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 0.1), atmSignMat);
    atmSign.position.set(-8, 3.4, 4.8);
    bank.add(atmSign);

    const atmLight = new THREE.PointLight(0x38bdf8, 1.0, 8);
    atmLight.position.set(-8, 2.5, 3.5);
    bank.add(atmLight);

    this.group.add(bank);

    this.interactables.push({
      id: 'bank',
      name: 'State Bank & ATM Kiosk',
      position: new THREE.Vector3(38, 0, -5),
      radius: 7.0
    });
  }

  private buildMarket() {
    const market = new THREE.Group();
    market.position.set(0, 0, 25);

    // Kirana & General Store
    const kirana = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 })
    );
    kirana.position.set(-6, 2.25, 0);
    kirana.castShadow = true;
    market.add(kirana);

    const kiranaSignMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('SHARMA KIRANA STORE', 'Daily Grocery • Tea • Snacks', '#c2410c', '#ffffff')
    });
    const kiranaSign = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.6, 0.2), kiranaSignMat);
    kiranaSign.position.set(-6, 4.0, 3.15);
    market.add(kiranaSign);

    // Chai Stall with Bench
    const chaiStall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3.5, 5),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
    );
    chaiStall.position.set(6, 1.75, 0);
    chaiStall.castShadow = true;
    market.add(chaiStall);

    const chaiSignMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('SPECIAL ASSAM CHAI', 'Garam Chai, Samosa & Adda', '#78350f', '#fde047')
    });
    const chaiSign = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.4, 0.2), chaiSignMat);
    chaiSign.position.set(6, 3.2, 2.65);
    market.add(chaiSign);

    this.group.add(market);

    this.interactables.push({
      id: 'market',
      name: 'Gramin Daily Bazar & Chai Stall',
      position: new THREE.Vector3(0, 0, 20),
      radius: 8.0
    });
  }

  private buildPoliceStation() {
    const police = new THREE.Group();
    police.position.set(-50, 0, 20);

    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(14, 5.5, 10),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 }) // Khaki/Mustard Thana style
    );
    bld.position.set(0, 2.75, 0);
    bld.castShadow = true;
    police.add(bld);

    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('ASSAM POLICE THANA', 'Service • Security • Courage', '#1e3a8a', '#ffffff')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(12, 2.0, 0.2), signMat);
    sign.position.set(0, 4.8, 5.15);
    police.add(sign);

    // Red & Blue beacon
    const beaconR = new THREE.PointLight(0xff0000, 0.8, 15);
    beaconR.position.set(-3, 6.0, 0);
    police.add(beaconR);
    const beaconB = new THREE.PointLight(0x0044ff, 0.8, 15);
    beaconB.position.set(3, 6.0, 0);
    police.add(beaconB);

    this.group.add(police);

    this.interactables.push({
      id: 'police',
      name: 'Village Police Thana',
      position: new THREE.Vector3(-50, 0, 25),
      radius: 7.0
    });
  }

  private buildHospital() {
    const hosp = new THREE.Group();
    hosp.position.set(55, 0, 25);

    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(16, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
    );
    bld.position.set(0, 3, 0);
    bld.castShadow = true;
    hosp.add(bld);

    // Red Cross Sign
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('CIVIL HOSPITAL (PHC)', '+ 24 Hr Emergency & OPD +', '#dc2626', '#ffffff')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 0.2), signMat);
    sign.position.set(0, 5.2, 6.15);
    hosp.add(sign);

    this.group.add(hosp);

    this.interactables.push({
      id: 'hospital',
      name: 'Civil Primary Health Centre',
      position: new THREE.Vector3(55, 0, 28),
      radius: 8.0
    });
  }

  private buildRailwayStation() {
    const stn = new THREE.Group();
    stn.position.set(60, 0, -75);

    // Platform
    const platGeo = new THREE.BoxGeometry(12, 1.2, 60);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.set(0, 0.6, 0);
    platform.receiveShadow = true;
    stn.add(platform);

    // Tracks
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x44403c, metalness: 0.8, roughness: 0.3 });
    for (let x of [-7.5, -6.0]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 60), trackMat);
      rail.position.set(x, 0.15, 0);
      stn.add(rail);
    }

    // Yellow Station Board (Indian Railways iconic style)
    const signMat = new THREE.MeshBasicMaterial({
      map: createSignboardTexture('BORPETA RLY HALT', 'North Frontier Railway', '#eab308', '#000000')
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 0.2), signMat);
    sign.position.set(0, 3.2, 0);
    stn.add(sign);

    this.group.add(stn);

    this.interactables.push({
      id: 'station',
      name: 'Village Railway Station',
      position: new THREE.Vector3(60, 0, -65),
      radius: 9.0
    });
  }

  private buildPlayground() {
    const ground = new THREE.Group();
    ground.position.set(-25, 0, 60);

    // Cricket Pitch (Clay/Mud strip)
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 24),
      new THREE.MeshStandardMaterial({ color: 0x9a7b56, roughness: 0.9 })
    );
    pitch.rotateX(-Math.PI / 2);
    pitch.position.y = 0.02;
    ground.add(pitch);

    // Wooden Wickets
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xecd79b, roughness: 0.5 });
    for (let z of [-10, 10]) {
      for (let x of [-0.3, 0, 0.3]) {
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), stumpMat);
        stump.position.set(x, 0.6, z);
        ground.add(stump);
      }
    }

    this.group.add(ground);

    this.interactables.push({
      id: 'playground',
      name: 'Cricket Field & Playground',
      position: new THREE.Vector3(-25, 0, 60),
      radius: 10.0
    });
  }

  private buildVegetation() {
    // Supari (Areca Betelnut) Palms and Banyan trees native to Assam
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f5c22, roughness: 0.8 });

    // Place trees in clusters around perimeter
    const treePositions = [
      [-25, -20], [-15, -35], [15, -15], [35, -25], [50, 0],
      [-30, 25], [20, 45], [-60, -10], [-40, 50], [45, 55]
    ];

    for (let [tx, tz] of treePositions) {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 7, 8), trunkMat);
      trunk.position.y = 3.5;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), leafMat);
      canopy.position.y = 7.5;
      canopy.scale.set(1.2, 1.5, 1.2);
      canopy.castShadow = true;
      tree.add(canopy);

      this.group.add(tree);
    }
  }

  public updateLights(isNight: boolean) {
    const intensity = isNight ? 1.6 : 0.05;
    this.streetLights.forEach(light => {
      light.intensity = intensity;
    });
  }
}
