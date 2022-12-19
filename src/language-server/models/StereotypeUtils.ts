import { OntologicalCategoryEnum } from "./OntologicalCategory";

const NonSortalStereotypes = [
    OntologicalCategoryEnum.CATEGORY,
    OntologicalCategoryEnum.MIXIN,
    OntologicalCategoryEnum.PHASE_MIXIN,
    OntologicalCategoryEnum.ROLE_MIXIN,
    OntologicalCategoryEnum.HISTORICAL_ROLE_MIXIN
];

const UltimateSortalStereotypes = [
    OntologicalCategoryEnum.KIND,
    OntologicalCategoryEnum.COLLECTIVE,
    OntologicalCategoryEnum.QUANTITY,
    OntologicalCategoryEnum.RELATOR,
    OntologicalCategoryEnum.QUALITY,
    OntologicalCategoryEnum.MODE
];

// TODO: consider renaming "base" to "lower"
const BaseSortalStereotypes = [
    OntologicalCategoryEnum.SUBKIND,
    OntologicalCategoryEnum.PHASE,
    OntologicalCategoryEnum.ROLE,
    OntologicalCategoryEnum.HISTORICAL_ROLE
];

const SortalStereotypes = [...UltimateSortalStereotypes, ...BaseSortalStereotypes];

// TODO: review if we should consider as rigid/anti-rigid/semi-rigid only those stereotypes whose respective types specialize Rigid/Anti-Rigid/Semi-Rigid in UFO. This introduces breaks to the gUFO transformation
const RigidStereotypes = [
    OntologicalCategoryEnum.KIND,
    OntologicalCategoryEnum.QUANTITY,
    OntologicalCategoryEnum.COLLECTIVE,
    OntologicalCategoryEnum.MODE,
    OntologicalCategoryEnum.QUALITY,
    OntologicalCategoryEnum.RELATOR,
    OntologicalCategoryEnum.SUBKIND,
    OntologicalCategoryEnum.CATEGORY,
    OntologicalCategoryEnum.EVENT,
    OntologicalCategoryEnum.SITUATION,
    OntologicalCategoryEnum.TYPE,
    OntologicalCategoryEnum.ABSTRACT,
    OntologicalCategoryEnum.DATATYPE,
    OntologicalCategoryEnum.ENUMERATION
];

const AntiRigidStereotypes = [
    OntologicalCategoryEnum.ROLE,
    OntologicalCategoryEnum.ROLE_MIXIN,
    OntologicalCategoryEnum.HISTORICAL_ROLE,
    OntologicalCategoryEnum.HISTORICAL_ROLE_MIXIN,
    OntologicalCategoryEnum.PHASE,
    OntologicalCategoryEnum.PHASE_MIXIN
];

const SemiRigidStereotypes = [OntologicalCategoryEnum.MIXIN];

const MomentOnlyStereotypes = [OntologicalCategoryEnum.MODE, OntologicalCategoryEnum.QUALITY, OntologicalCategoryEnum.RELATOR];

const SubstantialOnlyStereotypes = [OntologicalCategoryEnum.KIND, OntologicalCategoryEnum.QUANTITY, OntologicalCategoryEnum.COLLECTIVE];

const EndurantStereotypes = [...SortalStereotypes, ...NonSortalStereotypes];

const AbstractStereotypes = [OntologicalCategoryEnum.ABSTRACT, OntologicalCategoryEnum.DATATYPE, OntologicalCategoryEnum.ENUMERATION];




function isNonSortalClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return NonSortalStereotypes.includes(stereotype);
}

function isSortalClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return SortalStereotypes.includes(stereotype);
}

function isUltimateSortalClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return UltimateSortalStereotypes.includes(stereotype);
}

function isBaseSortalClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return BaseSortalStereotypes.includes(stereotype);
}

function isRigidClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return RigidStereotypes.includes(stereotype);
}

function isAntiRigidClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return AntiRigidStereotypes.includes(stereotype);
}

function isSemiRigidClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return SemiRigidStereotypes.includes(stereotype);
}

function isAbstractClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return AbstractStereotypes.includes(stereotype);
}

function isEndurantClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return EndurantStereotypes.includes(stereotype);
}

function isSubstantialClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return SubstantialOnlyStereotypes.includes(stereotype);
}

function isMomentClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return MomentOnlyStereotypes.includes(stereotype);
}

function isEventClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return stereotype === OntologicalCategoryEnum.EVENT;
}

function isSituationClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return stereotype === OntologicalCategoryEnum.SITUATION;
}

function isTypeClassStereotype(stereotype: OntologicalCategoryEnum): boolean {
    return stereotype === OntologicalCategoryEnum.TYPE;
}

export const stereotypeUtils = {
    // Class stereotypes arrays
    OntologicalCategoryEnum,
    AbstractStereotypes,
    EndurantStereotypes,
    SubstantialOnlyStereotypes,
    MomentOnlyStereotypes,
    NonSortalStereotypes,
    SortalStereotypes,
    UltimateSortalStereotypes,
    BaseSortalStereotypes,
    RigidStereotypes,
    AntiRigidStereotypes,
    SemiRigidStereotypes,
    // Relation stereotypes arrays
    // RelationStereotypes,
    // ExistentialDependencyRelationStereotypes,
    // ExistentialDependentSourceRelationStereotypes,
    // ExistentialDependentTargetRelationStereotypes,
    // PartWholeRelationStereotypes,
    // // Property stereotypes arrays
    // PropertyStereotypes,
    // ClassStereotype utility methods
    isNonSortalClassStereotype,
    isSortalClassStereotype,
    isUltimateSortalClassStereotype,
    isBaseSortalClassStereotype,
    isRigidClassStereotype,
    isAntiRigidClassStereotype,
    isSemiRigidClassStereotype,
    isAbstractClassStereotype,
    isEndurantClassStereotype,
    isSubstantialClassStereotype,
    isMomentClassStereotype,
    isEventClassStereotype,
    isSituationClassStereotype,
    isTypeClassStereotype
};
