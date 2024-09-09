export default class MessageFields {
    len: number = 0;
    maxLen: number = 0;
    bufferOffset: number = 0;

    static fromBuffer(buffer: Buffer, offset: number): MessageFields {
        const messageFields = new MessageFields();

        messageFields.len = buffer.readUInt16LE(offset + 0);
        messageFields.maxLen = buffer.readUInt16LE(offset + 2);
        messageFields.bufferOffset = buffer.readUInt32LE(offset + 4);

        return messageFields;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(8);

        let offset = 0;

        offset = buffer.writeUInt16LE(this.len, offset);
        offset = buffer.writeUInt16LE(this.maxLen, offset);
        offset = buffer.writeUInt32LE(this.bufferOffset, offset);

        return buffer;
    }
}