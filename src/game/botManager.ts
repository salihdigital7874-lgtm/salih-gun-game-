import * as THREE from 'three';
import { BotEntity, GameSettings } from '../types/game';
import { createWeaponMesh } from './weaponModels';
import { getWeaponByTier } from './weapons';
import { createSalihCharacterMesh } from './salihCharacter';

const BOT_NAMES = ['Salih-01', 'Salih-Pro', 'Salih-Commander', 'Salih-Apex', 'Salih-Vanguard', 'Salih-Ghost'];
const BOT_COLORS = ['#881337', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#b91c1c'];

export class BotManager {
  public bots: BotEntity[] = [];
  private scene: THREE.Scene;
  private spawnPoints: THREE.Vector3[];

  constructor(scene: THREE.Scene, spawnPoints: THREE.Vector3[]) {
    this.scene = scene;
    this.spawnPoints = spawnPoints;
  }

  public initBots(settings: GameSettings) {
    this.clearBots();
    const count = Math.min(settings.botCount, BOT_NAMES.length);

    for (let i = 0; i < count; i++) {
      const spawnIdx = i % this.spawnPoints.length;
      const spawnPos = this.spawnPoints[spawnIdx].clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        0,
        (Math.random() - 0.5) * 4
      ));

      const botColor = BOT_COLORS[i % BOT_COLORS.length];
      const mesh = this.createBotCharacterMesh(botColor);
      mesh.position.copy(spawnPos);
      this.scene.add(mesh);

      const bot: BotEntity = {
        id: `bot_${i}`,
        name: BOT_NAMES[i],
        currentTier: 1,
        health: 100,
        maxHealth: 100,
        mesh,
        position: spawnPos.clone(),
        velocity: new THREE.Vector3(),
        targetPosition: spawnPos.clone(),
        state: 'patrol',
        stateTimer: 0,
        shootCooldown: 0.5 + Math.random() * 0.8,
        kills: 0,
        deaths: 0,
        color: botColor,
        respawnTimer: 0,
        isGrounded: true,
      };

      this.updateBotWeapon(bot);
      this.bots.push(bot);
    }
  }

  public updateBotWeapon(bot: BotEntity) {
    // Remove existing signature rifle if any
    const existingSig = bot.mesh.getObjectByName('salih_signature_rifle');
    if (existingSig && bot.weaponMesh) {
      bot.mesh.remove(existingSig);
    }

    if (bot.weaponMesh) {
      bot.mesh.remove(bot.weaponMesh);
      bot.weaponMesh.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
    }

    const weaponDef = getWeaponByTier(bot.currentTier);
    const wMesh = createWeaponMesh(weaponDef.id);
    wMesh.scale.set(0.7, 0.7, 0.7);
    wMesh.position.set(0.24, 0.95, 0.35);
    wMesh.rotation.y = -0.05;
    bot.mesh.add(wMesh);
    bot.weaponMesh = wMesh;
  }

  private createBotCharacterMesh(_accentHex: string): THREE.Group {
    return createSalihCharacterMesh();
  }

  public respawnBot(bot: BotEntity) {
    const spawnIdx = Math.floor(Math.random() * this.spawnPoints.length);
    const spawnPos = this.spawnPoints[spawnIdx].clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      0,
      (Math.random() - 0.5) * 3
    ));
    bot.health = bot.maxHealth;
    bot.position.copy(spawnPos);
    bot.velocity.set(0, 0, 0);
    bot.mesh.position.copy(spawnPos);
    bot.mesh.visible = true;
    bot.state = 'patrol';
    bot.stateTimer = 0;
    bot.respawnTimer = 0;
  }

  public clearBots() {
    this.bots.forEach((b) => {
      this.scene.remove(b.mesh);
      b.mesh.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
    });
    this.bots = [];
  }
}
