// /*
//  * @Description: In User Settings Edit
//  * @Author: your name
//  * @Date: 2019-10-19 09:56:51
//  * @LastEditTime: 2019-10-19 09:56:51
//  * @LastEditors: your name
//  */
// /*
//  * @Descripttion: 
//  * @version: 
//  * @Author: ZengFeng
//  * @Date: 2019-10-18 11:23:07
//  * @LastEditors: ZengFeng
//  * @LastEditTime: 2019-10-18 11:23:07
//  */
// declare class IntAcosTable {
//     static COUNT: number;
//     static HALF_COUNT: number;
//     static table: number[];
// }
// declare class IAsinTable {
//     static COUNT: number;
//     static HALF_COUNT: number;
//     static table: number[];
// }
// declare class IntAtan2Table {
//     static BITS: number;
//     static BITS2: number;
//     static MASK: number;
//     static COUNT: number;
//     static DIM: number;
//     static table: number[];
// }
// declare class IPhysicsConfig {
//     private static _grid;
//     static readonly grid: Laya.Rectangle;
//     static GenKey(i: any, j: any): any;
//     static debugCtx: Laya.Sprite;
//     static SkipId(a: IPNode, b: IPNode): boolean;
//     static SkipGroup(a: IPNode, b: IPNode): boolean;
//     static CollideTest(a: IPNode, b: IPNode): boolean;
//     static frame: number;
// }
// declare class IPNode {
//     id: number;
//     group: number;
//     owner: any;
//     private _keys;
//     private _halfW;
//     private _halfH;
//     private _vec2;
//     static _id: number;
//     private constructor();
//     private Init;
//     static New(x: number, y: number, w: number, h: number, group: number, owner: any): IPNode;
//     x: number;
//     y: number;
//     readonly vec2: IVector2;
//     readonly w: number;
//     readonly h: number;
//     readonly oldKeys: any[];
//     Reserve(): void;
//     readonly newKeys: any[];
// }
// declare enum IRayCastType {
//     All = 1,
//     ClosestOne = 2,
//     ClosestAll = 3
// }
// declare class IPhysics {
//     private _word;
//     static default: IPhysics;
//     Insert(node: IPNode): void;
//     UpdateNode(node: IPNode): void;
//     DelNode(node: IPNode): void;
//     Clear(): void;
//     GetCollisions(self: IPNode, skipFunc?: Function): any[];
//     GetCollisions2(self: IPNode, skipFunc?: Function): any[];
//     RayCast(pos: IVector2, odir: IVector2, dis: number, type: IRayCastType, skip: IPNode, skipFunc?: Function): any[];
// }
// declare class IQuaternion {
//     x: number;
//     y: number;
//     z: number;
//     w: number;
//     constructor(x: number, y: number, z: number, w: number);
//     private static _identity;
//     static readonly identity: IQuaternion;
//     static EulerYaw(y: number): IQuaternion;
//     static Euler(x: number, y: number, z: number): IQuaternion;
//     MulVector3(v: IVector3): IVector3;
// }
// declare class ISinCosTable {
//     static BITS: number;
//     static MASK: number;
//     static COUNT: number;
//     static FACTOR: number;
//     static NOM_MUL: number;
//     static table: number[];
//     static cos_table: number[];
//     static GetIndex(nom: number, den: number): number;
// }
// declare class IVector2 {
//     x: number;
//     y: number;
//     constructor(x: number, y: number);
//     readonly viewVec2: Laya.Vector2;
//     readonly viewVec3: Laya.Vector3;
//     readonly sqrMagnitude: number;
//     readonly magnitude: number;
//     Dot(b: IVector2): number;
//     Dup(): IVector2;
//     Add(b: IVector2): IVector2;
//     AddSelf(b: IVector2): IVector2;
//     DivSelf(n: number): IVector2;
//     NormalizeSelf(): IVector2;
//     readonly normalizeSelf: IVector2;
//     Normalize(): IVector2;
//     Mul(f: IntFactor): IVector2;
//     MulSelf(f: IntFactor): IVector2;
//     Sub(b: IVector2): IVector2;
//     SubSelf(b: IVector2): IVector2;
//     MulInt(f: number): IVector2;
//     MulIntWf(f: number): IVector2;
//     MulIntSelf(f: number): IVector2;
//     static readonly zero: IVector2;
//     static readonly forward: IVector2;
//     static readonly left: IVector2;
//     static readonly right: IVector2;
//     CopyValueFrom(src: IVector2): void;
// }
// declare class IVector3 {
//     x: number;
//     y: number;
//     z: number;
//     constructor(x: number, y: number, z: number);
//     readonly sqrMagnitude: number;
//     readonly magnitude: number;
//     Dup(): IVector3;
//     static readonly zero: IVector3;
//     static readonly forward: IVector3;
// }
// declare class IntFactor {
//     numerator: number;
//     denominator: number;
//     constructor(numerator: number, denominator: number);
//     static readonly zero: IntFactor;
//     static readonly one: IntFactor;
//     static readonly pi: IntFactor;
//     readonly intNumerator: number;
//     readonly double: number;
//     readonly integer: number;
//     SetNumerator(d: number): void;
//     SetDenominator(d: number): IntFactor;
//     Add(b: IntFactor): IntFactor;
//     AddInt(b: number): IntFactor;
//     Sub(b: IntFactor): IntFactor;
//     SubInt(b: number): IntFactor;
//     Div(b: IntFactor): IntFactor;
//     DivInt(b: number): IntFactor;
//     Mul(f2: IntFactor): IntFactor;
//     MulInt(f2: number): IntFactor;
//     CopyValueFrom(src: IntFactor): IntFactor;
//     absSelf(): void;
//     abs(): IntFactor;
//     Negative(): IntFactor;
//     NegativeSelf(): IntFactor;
//     setValue(value: number): IntFactor;
//     setWfValue(value: number): IntFactor;
//     /** 获取万分值 */
//     readonly wfValue: number;
//     private static helpA;
//     private static helpB;
//     /** 除法：参数和返回数值都是 万分比 */
//     static Divide(a: number, b: number): number;
//     /** 乘法：参数和返回数值都是 万分比 */
//     static Mul(a: number, b: number): number;
//     IsMore(value?: number): boolean;
//     IsMoreAndEqual(value?: number): boolean;
//     IsLess(value?: number): boolean;
//     IsLessAndEqual(value?: number): boolean;
// }
// declare class IntMath {
//     static assert: boolean;
//     static seed: number;
//     static BaseCalFactor: number;
//     static HalfCalFactor: number;
//     static Deg2Rad: IntFactor;
//     static Rad2Deg: IntFactor;
//     static AngleMax: number;
//     static HalfAngleMax: number;
//     static QuarterAngleMax: number;
//     static NumberAssert(num: number): void;
//     static Clamp(a: number, min: number, max: number): number;
//     static Divide(a: number, b: number): number;
//     static DivideCeil(a: number, b: number): number;
//     static DivideFloor(a: number, b: number): number;
//     static Sqrt(a: number): number;
//     static Sign(value: number): number;
//     static Abs(value: number): number;
//     static Sin(nom: number, den: number): IntFactor;
//     static Cos(nom: number, den: number): IntFactor;
//     static Acos(nom: number, den: number): IntFactor;
//     static Asin(nom: number, den: number): IntFactor;
//     static AngleIntRad(lhs: IVector2, rhs: IVector2): IntFactor;
//     static ClampAngleTo180(a: IntFactor): IntFactor;
//     static AngleInt(lhs: IVector2, rhs: IVector2): number;
//     static DivideVec33(a: IVector3, m: number, b: number): IVector3;
//     static DivideVec23(a: IVector2, m: number, b: number): IVector2;
//     static DivideVec32(a: IVector3, b: number): IVector3;
//     static DivideVec22(a: IVector2, b: number): IVector2;
//     static Random(min: number, max: number): number;
//     static Repeat(t: number, length: number): number;
//     static DeltaAngle(current: number, target: number): number;
//     static MoveTowards(current: number, target: number, maxDelta: number): number;
//     static MoveTowardsAngle(current: number, target: number, maxDelta: number): number;
//     static ClampMagnitude2(vector: IVector2, maxLength: number): IVector2;
//     static Dot2(lhs: IVector2, rhs: IVector2): number;
//     static SmoothDamp2(current: IVector2, target: IVector2, currentVelocity: IVector2, smoothTime: number, maxSpeed: number, deltaTime: number): IVector2;
// }
