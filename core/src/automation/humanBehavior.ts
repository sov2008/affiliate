import { Page } from 'playwright';

export interface TypeOptions {
  minDelay?: number;
  maxDelay?: number;
  typoProbability?: number;
}

export interface MoveOptions {
  steps?: number;
  overshootProbability?: number;
}

export class HumanBehaviorEngine {
  private static lastMouseX = 100;
  private static lastMouseY = 100;

  /**
   * Generates a random integer between min and max (inclusive) with optional gaussian clustering
   */
  public static getRandomInt(min: number, max: number, gaussian: boolean = true): number {
    if (!gaussian) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6;
    const val = Math.round(mean + z * stdDev);
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Natural human sleep with randomized jitter
   */
  public static async humanPause(minMs: number = 300, maxMs: number = 800): Promise<void> {
    const delay = this.getRandomInt(minMs, maxMs);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Simulates human keystrokes with Gaussian delay and realistic typo/correction injection.
   */
  public static async humanType(
    page: Page,
    selector: string,
    text: string,
    options: TypeOptions = {}
  ): Promise<void> {
    const minDelay = options.minDelay ?? 40;
    const maxDelay = options.maxDelay ?? 140;
    const typoProbability = options.typoProbability ?? 0.02; // 2% chance of realistic typo

    const element = page.locator(selector).first();
    await this.humanMoveAndClick(page, selector);
    await this.humanPause(150, 300);

    const keyboardNeighbors: Record<string, string[]> = {
      a: ['s', 'q', 'w', 'z'],
      b: ['v', 'g', 'h', 'n'],
      c: ['x', 'd', 'f', 'v'],
      d: ['s', 'e', 'r', 'f', 'x', 'c'],
      e: ['w', 's', 'd', 'r'],
      f: ['d', 'r', 't', 'g', 'c', 'v'],
      g: ['f', 't', 'y', 'h', 'v', 'b'],
      h: ['g', 'y', 'u', 'j', 'b', 'n'],
      i: ['u', 'j', 'k', 'o'],
      j: ['h', 'u', 'i', 'k', 'n', 'm'],
      k: ['j', 'i', 'o', 'l', 'm'],
      l: ['k', 'o', 'p'],
      m: ['n', 'j', 'k'],
      n: ['b', 'h', 'j', 'm'],
      o: ['i', 'k', 'l', 'p'],
      p: ['o', 'l'],
      q: ['w', 'a'],
      r: ['e', 'd', 'f', 't'],
      s: ['a', 'w', 'e', 'd', 'x', 'z'],
      t: ['r', 'f', 'g', 'y'],
      u: ['y', 'h', 'j', 'i'],
      v: ['c', 'f', 'g', 'b'],
      w: ['q', 'a', 's', 'e'],
      x: ['z', 's', 'd', 'c'],
      y: ['t', 'g', 'h', 'u'],
      z: ['a', 's', 'x'],
    };

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const lower = char.toLowerCase();

      // Check if we should simulate a typo
      if (
        typoProbability > 0 &&
        keyboardNeighbors[lower] &&
        Math.random() < typoProbability &&
        i > 0 &&
        i < text.length - 1
      ) {
        const neighbors = keyboardNeighbors[lower];
        const typoChar = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Type typo character
        await page.keyboard.type(typoChar);
        await new Promise((r) => setTimeout(r, this.getRandomInt(120, 260))); // pause noticing mistake
        
        // Backspace to correct
        await page.keyboard.press('Backspace');
        await new Promise((r) => setTimeout(r, this.getRandomInt(90, 180)));
      }

      // Type the actual character
      await page.keyboard.type(char);

      // Variable inter-keystroke delay
      let delay = this.getRandomInt(minDelay, maxDelay, true);
      // Punctuation and spaces typically have longer pauses in human typing
      if (['.', ',', '!', '?', '\n'].includes(char)) {
        delay += this.getRandomInt(200, 450);
      } else if (char === ' ') {
        delay += this.getRandomInt(40, 110);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  /**
   * Moves mouse along a realistic Cubic Bezier curve with micro-jitter and clicks.
   */
  public static async humanMoveAndClick(
    page: Page,
    selector: string,
    options: MoveOptions = {}
  ): Promise<void> {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 10000 });
    const box = await element.boundingBox();

    if (!box) {
      await element.click();
      return;
    }

    // Target inside element with slight padding
    const targetX = box.x + box.width * (0.3 + Math.random() * 0.4);
    const targetY = box.y + box.height * (0.3 + Math.random() * 0.4);

    const startX = this.lastMouseX;
    const startY = this.lastMouseY;

    const steps = options.steps ?? this.getRandomInt(18, 35);
    const overshootProbability = options.overshootProbability ?? 0.3;

    // Generate Bezier Control Points
    const controlX1 = startX + (targetX - startX) * 0.25 + this.getRandomInt(-50, 50);
    const controlY1 = startY + (targetY - startY) * 0.1 + this.getRandomInt(-40, 40);
    const controlX2 = startX + (targetX - startX) * 0.75 + this.getRandomInt(-30, 30);
    const controlY2 = startY + (targetY - startY) * 0.9 + this.getRandomInt(-30, 30);

    // Curve motion
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Cubic Bezier Formula
      const cx =
        Math.pow(1 - t, 3) * startX +
        3 * Math.pow(1 - t, 2) * t * controlX1 +
        3 * (1 - t) * Math.pow(t, 2) * controlX2 +
        Math.pow(t, 3) * targetX;

      const cy =
        Math.pow(1 - t, 3) * startY +
        3 * Math.pow(1 - t, 2) * t * controlY1 +
        3 * (1 - t) * Math.pow(t, 2) * controlY2 +
        Math.pow(t, 3) * targetY;

      // Add micro-jitter (sub-pixel human tremor)
      const jitterX = cx + (Math.random() - 0.5) * 1.5;
      const jitterY = cy + (Math.random() - 0.5) * 1.5;

      await page.mouse.move(jitterX, jitterY);
      const stepDelay = Math.max(4, Math.round(16 * (1 - Math.sin(t * Math.PI) * 0.4)));
      await new Promise((resolve) => setTimeout(resolve, stepDelay));
    }

    // Micro overshoot simulation
    if (Math.random() < overshootProbability) {
      const overX = targetX + (Math.random() - 0.5) * 6;
      const overY = targetY + (Math.random() - 0.5) * 6;
      await page.mouse.move(overX, overY);
      await new Promise((resolve) => setTimeout(resolve, this.getRandomInt(20, 50)));
      await page.mouse.move(targetX, targetY);
    }

    this.lastMouseX = targetX;
    this.lastMouseY = targetY;

    // Pre-click hesitation
    await this.humanPause(60, 150);
    await page.mouse.down();
    // Click duration
    await new Promise((resolve) => setTimeout(resolve, this.getRandomInt(50, 110)));
    await page.mouse.up();
    // Post-click pause
    await this.humanPause(80, 200);
  }

  /**
   * Performs smooth non-linear human scrolling with organic velocity and pauses.
   */
  public static async humanScroll(
    page: Page,
    direction: 'down' | 'up' = 'down',
    steps: number = 4
  ): Promise<void> {
    const factor = direction === 'down' ? 1 : -1;
    for (let i = 0; i < steps; i++) {
      const deltaY = this.getRandomInt(120, 320) * factor;
      await page.mouse.wheel(0, deltaY);
      await this.humanPause(120, 350);
    }
    await this.humanPause(300, 700);
  }
}
