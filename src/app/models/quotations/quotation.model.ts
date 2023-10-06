export class Quotation {
    constructor(
        public id: number,
        public date_quo: string,
        public code_quo: string,
        public id_client: number,
        public id_iva: number,
        public created: string,
        public status: boolean,
    ) {

    }
}