import { ClassStereotype, Package } from "ontouml-js"
import { ClassElement } from "../../language-server/generated/ast"

export function classElementGenerator(classElement: ClassElement, packageItem: Package ): void {
    if (!!classElement.classElementType) {
        const stereotype = classElement.classElementType.stereotype
        switch (stereotype) {
            case 'category':
                packageItem.createCategory(classElement.name)
            case 'mixin':
                packageItem.createMixin(classElement.name)
            case 'phaseMixin':
                packageItem.createPhaseMixin(classElement.name)
            case 'roleMixin':
                packageItem.createRoleMixin(classElement.name)
            case 'historicalRoleMixin':
                packageItem.createRoleMixin(classElement.name)
            case 'event':
                packageItem.createEvent(classElement.name)
            case 'kind':
                packageItem.createKind(classElement.name)
            case 'collective':
                packageItem.createCollective(classElement.name)
            case 'quantity':
                packageItem.createQuantity(classElement.name)
            case 'quality':
                packageItem.createQuality(classElement.name)
            case 'mode':
                packageItem.createClass(classElement.name, ClassStereotype.MODE)
            case 'intrinsicMode':
                packageItem.createIntrinsicMode(classElement.name)
            case 'extrinsicMode':
                packageItem.createExtrinsicMode(classElement.name)
            case 'subkind':
                packageItem.createSubkind(classElement.name)
            case 'phase':
                packageItem.createPhase(classElement.name)
            case 'role':
                packageItem.createRole(classElement.name)
            case 'historicalRole':
                packageItem.createHistoricalRole(classElement.name)
            case 'relator':
                packageItem.createRelator(classElement.name)
        }
    } else {
        packageItem.createClass(classElement.name)
    }
}