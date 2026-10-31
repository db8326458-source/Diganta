import * as THREE from 'three';
import { PlayerCustomization } from '../types/game';

export class Character3D {
  public group: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private head: THREE.Group;
  private torsoMat!: THREE.MeshStandardMaterial;
  private pantsMat!: THREE.MeshStandardMaterial;
  private skinMat!: THREE.MeshStandardMaterial;
  private animTimer: number = 0;

  constructor(customization: PlayerCustomization) {
    this.group = new THREE.Group();
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.head = new THREE.Group();

    this.buildBody(customization);
  }

  private buildBody(c: PlayerCustomization) {
    this.skinMat = new THREE.MeshStandardMaterial({
      color: c.skinTone || '#c68642',
      roughness: 0.65,
      metalness: 0.05
    });

    this.torsoMat = new THREE.MeshStandardMaterial({
      color: c.outfitColor || '#1e3a8a',
      roughness: 0.7,
      metalness: 0.05
    });

    this.pantsMat = new THREE.MeshStandardMaterial({
      color: c.pantsColor || '#f8fafc',
      roughness: 0.8,
      metalness: 0.05
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.5
    });

    // 1. Torso & Clothes
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.38);
    const torso = new THREE.Mesh(torsoGeo, this.torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);

    // If Kurta, add lower skirt/drape
    if (c.outfitStyle === 'kurta') {
      const kurtaHem = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.45, 0.4),
        this.torsoMat
      );
      kurtaHem.position.y = 0.88;
      kurtaHem.castShadow = true;
      this.group.add(kurtaHem);

      // Traditional Indian gamucha / stole on shoulder
      const stoleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.9 });
      const stole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.42), stoleMat);
      stole.position.set(-0.25, 1.35, 0);
      this.group.add(stole);
    }

    // 2. Head & Hair
    this.head.position.set(0, 1.95, 0);
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.36), this.skinMat);
    face.castShadow = true;
    this.head.add(face);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const hairGeo = new THREE.BoxGeometry(0.42, 0.22, 0.4);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.22;
    this.head.add(hair);

    this.group.add(this.head);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const handGeo = new THREE.BoxGeometry(0.16, 0.18, 0.16);

    // Left Arm
    this.leftArm.position.set(-0.48, 1.65, 0);
    const lArmMesh = new THREE.Mesh(armGeo, this.torsoMat);
    lArmMesh.position.y = -0.32;
    lArmMesh.castShadow = true;
    const lHand = new THREE.Mesh(handGeo, this.skinMat);
    lHand.position.y = -0.7;
    this.leftArm.add(lArmMesh);
    this.leftArm.add(lHand);
    this.group.add(this.leftArm);

    // Right Arm
    this.rightArm.position.set(0.48, 1.65, 0);
    const rArmMesh = new THREE.Mesh(armGeo, this.torsoMat);
    rArmMesh.position.y = -0.32;
    rArmMesh.castShadow = true;
    const rHand = new THREE.Mesh(handGeo, this.skinMat);
    rHand.position.y = -0.7;
    this.rightArm.add(rArmMesh);
    this.rightArm.add(rHand);
    this.group.add(this.rightArm);

    // 4. Legs & Shoes
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const shoeGeo = new THREE.BoxGeometry(0.26, 0.16, 0.38);

    // Left Leg
    this.leftLeg.position.set(-0.2, 0.9, 0);
    const lLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    lLegMesh.position.y = -0.38;
    lLegMesh.castShadow = true;
    const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
    lShoe.position.set(0, -0.82, 0.05);
    lShoe.castShadow = true;
    this.leftLeg.add(lLegMesh);
    this.leftLeg.add(lShoe);
    this.group.add(this.leftLeg);

    // Right Leg
    this.rightLeg.position.set(0.2, 0.9, 0);
    const rLegMesh = new THREE.Mesh(legGeo, this.pantsMat);
    rLegMesh.position.y = -0.38;
    rLegMesh.castShadow = true;
    const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rShoe.position.set(0, -0.82, 0.05);
    rShoe.castShadow = true;
    this.rightLeg.add(rLegMesh);
    this.rightLeg.add(rShoe);
    this.group.add(this.rightLeg);
  }

  public updateAnimation(speed: number, delta: number, isDriving: boolean = false) {
    if (isDriving) {
      // Sitting posture
      this.leftLeg.rotation.x = -Math.PI / 2.5;
      this.rightLeg.rotation.x = -Math.PI / 2.5;
      this.leftArm.rotation.x = -Math.PI / 3;
      this.rightArm.rotation.x = -Math.PI / 3;
      this.leftArm.rotation.z = -0.2;
      this.rightArm.rotation.z = 0.2;
      return;
    }

    if (speed > 0.1) {
      this.animTimer += delta * speed * 7.0;
      const legSwing = Math.sin(this.animTimer) * 0.65;
      const armSwing = Math.sin(this.animTimer) * 0.55;

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;
      this.head.rotation.y = Math.sin(this.animTimer * 0.5) * 0.05;
    } else {
      // Idle relaxation
      this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 8, delta);
      this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 8, delta);
      this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 0, 8, delta);
      this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, 0, 8, delta);
      this.leftArm.rotation.z = THREE.MathUtils.damp(this.leftArm.rotation.z, 0, 8, delta);
      this.rightArm.rotation.z = THREE.MathUtils.damp(this.rightArm.rotation.z, 0, 8, delta);
    }
  }

  public setAppearance(c: PlayerCustomization) {
    this.skinMat.color.set(c.skinTone || '#c68642');
    this.torsoMat.color.set(c.outfitColor || '#1e3a8a');
    this.pantsMat.color.set(c.pantsColor || '#f8fafc');
  }
}
