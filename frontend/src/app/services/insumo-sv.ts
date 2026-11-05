import { Service } from '@angular/core';
import { InsumoIn } from '../interfaces/insumo-in';

@Service()
export class InsumoSv {
    private InsumoDB : InsumoIn[]=[]

    guardar(InsumoIn:InsumoIn){
        this.InsumoDB.push(InsumoIn)
    }

    mostrar() {
        return this.InsumoDB
    }
}
