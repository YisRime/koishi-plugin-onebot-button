export class ProtobufEncoder {
  /**
   * 将 JavaScript 对象编码为 protobuf 二进制格式
   * @param obj - 要编码的对象
   * @returns 编码后的二进制数据
   */
  encode(obj: any): Uint8Array {
    const buffer: number[] = []
    for (const tag of Object.keys(obj).sort((a, b) => parseInt(a) - parseInt(b))) this._encode(buffer, parseInt(tag), obj[tag])
    return new Uint8Array(buffer)
  }

  /**
   * 使用给定标签编码值
   * @private
   */
  private _encode(buffer: number[], tag: number, value: any): void {
    if (Array.isArray(value)) {
      for (const item of value) this._encodeValue(buffer, tag, item)
    } else {
      this._encodeValue(buffer, tag, value)
    }
  }

  /**
   * 根据类型编码单个值
   * @private
   */
  private _encodeValue(buffer: number[], tag: number, value: any): void {
    if (value === null || value === undefined) return
    if (typeof value === 'number') {
      this._encodeVarint(buffer, tag, value)
    } else if (typeof value === 'boolean') {
      this._encodeBool(buffer, tag, value)
    } else if (typeof value === 'string') {
      this._encodeString(buffer, tag, value)
    } else if (value instanceof Uint8Array || value instanceof Buffer) {
      this._encodeBytes(buffer, tag, value)
    } else if (typeof value === 'object') {
      const nested = this.encode(value)
      this._encodeBytes(buffer, tag, nested)
    } else {
      throw new TypeError(`Unsupported type ${typeof value}`)
    }
  }

  /**
   * 编码可变长度整数
   * @private
   */
  private _encodeVarint(buffer: number[], tag: number, value: number): void {
    const key = (tag << 3) | 0
    this._writeVarint(buffer, key)
    this._writeVarint(buffer, value)
  }

  /**
   * 编码布尔值
   * @private
   */
  private _encodeBool(buffer: number[], tag: number, value: boolean): void {
    this._encodeVarint(buffer, tag, value ? 1 : 0)
  }

  /**
   * 编码字符串值
   * @private
   */
  private _encodeString(buffer: number[], tag: number, value: string): void {
    const key = (tag << 3) | 2
    const encoded = Buffer.from(value, 'utf-8')
    this._writeVarint(buffer, key)
    this._writeVarint(buffer, encoded.length)
    buffer.push(...encoded)
  }

  /**
   * 编码字节数据
   * @private
   */
  private _encodeBytes(buffer: number[], tag: number, value: Uint8Array | Buffer): void {
    const key = (tag << 3) | 2
    this._writeVarint(buffer, key)
    this._writeVarint(buffer, value.length)
    buffer.push(...value)
  }

  /**
   * 向缓冲区写入可变长度整数
   * @private
   */
  private _writeVarint(buffer: number[], value: number): void {
    value = value >>> 0
    while (true) {
      const byte = value & 0x7F
      value >>>= 7
      if (value) {
        buffer.push(byte | 0x80)
      } else {
        buffer.push(byte)
        break
      }
    }
  }
}
