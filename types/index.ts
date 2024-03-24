
export type ObjectId = string;

export type Producer = {
    _id: ObjectId;
    name: string;
    country: string;
    region: string;
}

export type Product = {
    _id: ObjectId;
    vintage: string;
    name: string;
    producerId: string;
    producer: Producer;
}