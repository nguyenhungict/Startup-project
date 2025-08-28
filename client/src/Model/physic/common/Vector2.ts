// physic/Mechanics/Kinematics/Vector2.ts
export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(divisor: number): Vector2 {
    if (divisor === 0) throw new Error("Division by zero");
    return new Vector2(this.x / divisor, this.y / divisor);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  length(): number {
    return this.magnitude();
  }

  normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2(0, 0);
    return this.divide(mag);
  }

  // Additional utility methods that might be useful
  distanceTo(other: Vector2): number {
    return this.subtract(other).magnitude();
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  // Static utility methods
  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  static up(): Vector2 {
    return new Vector2(0, -1);
  }

  static down(): Vector2 {
    return new Vector2(0, 1);
  }

  static left(): Vector2 {
    return new Vector2(-1, 0);
  }

  static right(): Vector2 {
    return new Vector2(1, 0);
  }
}