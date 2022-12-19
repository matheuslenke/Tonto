enum OntologicalCategoryEnum {
    CLASS = "class",
    TYPE = "type",
    HISTORICAL_ROLE = "historicalRole",
    HISTORICAL_ROLE_MIXIN = "historicalRoleMixin",
    EVENT = "event",
    SITUATION = "situation",
    CATEGORY = "category",
    MIXIN = "mixin",
    ROLE_MIXIN = "roleMixin",
    PHASE_MIXIN = "phaseMixin",
    KIND = "kind",
    COLLECTIVE = "collective",
    QUANTITY = "quantity",
    RELATOR = "relator",
    QUALITY = "quality",
    MODE = "mode",
    INTRINSIC_MODE = "intrinsicMode",
    EXTRINSIC_MODE = "extrinsicMode",
    SUBKIND = "subkind",
    ROLE = "role",
    PHASE = "phase",
    ENUMERATION = "enumeration",
    DATATYPE = "datatype",
    ABSTRACT = "abstract",
}

const UltimateSortalOntoCategories = [
    OntologicalCategoryEnum.KIND,
    OntologicalCategoryEnum.COLLECTIVE,
    OntologicalCategoryEnum.QUANTITY,
    OntologicalCategoryEnum.RELATOR,
    OntologicalCategoryEnum.QUALITY,
    OntologicalCategoryEnum.MODE
]

const BaseSortalOntoCategories = [
    OntologicalCategoryEnum.SUBKIND,
    OntologicalCategoryEnum.PHASE,
    OntologicalCategoryEnum.ROLE,
    OntologicalCategoryEnum.HISTORICAL_ROLE
]

const SortalOntoCategories = [...UltimateSortalOntoCategories, ...BaseSortalOntoCategories]

function isSortalOntoCategory(stereotype: String): boolean {
    const ontologicalCategory = allOntologicalCategories.find(category => category === stereotype)
    if (ontologicalCategory) {
        const categoryExists = SortalOntoCategories.find(category => category === ontologicalCategory)
        if (categoryExists && categoryExists?.length > 0) {
            return true
        }
    }
    return false
}

const allOntologicalCategories = [
    ...SortalOntoCategories
]

export { OntologicalCategoryEnum, UltimateSortalOntoCategories, BaseSortalOntoCategories, SortalOntoCategories, isSortalOntoCategory }

