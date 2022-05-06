import { stereotypeUtils } from './StereotypeUtils';
import { EndurantTypes } from './EndurantType';

export class Endurant {
  name: string
  type: EndurantTypes


  constructor(base?: Partial<Endurant>) {
    this.name = base?.name ?? "unamed";
    this.type = base?.type ?? EndurantTypes.KIND;
  }

  hasSortalStereotype() {
    const sortals = stereotypeUtils.SortalStereotypes
    const isSortal = sortals.includes(this.type)
    return isSortal
  }
}