/******************************************************************************
 * This file was generated by langium-cli 0.3.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, Reference, isAstNode } from 'langium';

export type AuxiliaryDeclarations = DataType | ElementReference | EnumData | GeneralizationSet;

export const AuxiliaryDeclarations = 'AuxiliaryDeclarations';

export function isAuxiliaryDeclarations(item: unknown): item is AuxiliaryDeclarations {
    return reflection.isInstance(item, AuxiliaryDeclarations);
}

export type BaseSortalStereotype = 'historicalrole' | 'phase' | 'relator' | 'role' | 'subkind';

export type Element = AuxiliaryDeclarations | ClassElement;

export const Element = 'Element';

export function isElement(item: unknown): item is Element {
    return reflection.isInstance(item, Element);
}

export type NonSortalStereotype = 'category' | 'event' | 'historicalrolemixin' | 'mixin' | 'phasemixin' | 'rolemixin';

export type QualifiedName = string;

export type RelationStereotype = 'aggregation' | 'bringsAbout' | 'characterization' | 'comparative' | 'componentOf' | 'composition' | 'creation' | 'derivation' | 'externalDependence' | 'historicalDependence' | 'instantiation' | 'manifestation' | 'material' | 'mediation' | 'memberOf' | 'participation' | 'participational' | 'relator' | 'subCollectionOf' | 'subQuantityOf' | 'termination' | 'triggers';

export type UltimateSortalStereotypes = 'collective' | 'kind' | 'mode' | 'quality' | 'quantity';

export interface Cardinality extends AstNode {
    readonly $container: ElementReference;
    lowerBound: '*' | number
    upperBound: '*' | number
}

export const Cardinality = 'Cardinality';

export function isCardinality(item: unknown): item is Cardinality {
    return reflection.isInstance(item, Cardinality);
}

export interface ClassElement extends AstNode {
    readonly $container: ClassElement | ContextModule;
    instanceOf?: Reference<ClassElement>
    name: QualifiedName
    prefix: ClassPrefix
    references: ElementReference
    specializationClasses: Array<Reference<ClassElement>>
    specializationEndurants: Array<Reference<ClassElement>>
    type: EndurantType
}

export const ClassElement = 'ClassElement';

export function isClassElement(item: unknown): item is ClassElement {
    return reflection.isInstance(item, ClassElement);
}

export interface ClassPrefix extends AstNode {
    readonly $container: ClassElement;
    stereotype: Stereotype
}

export const ClassPrefix = 'ClassPrefix';

export function isClassPrefix(item: unknown): item is ClassPrefix {
    return reflection.isInstance(item, ClassPrefix);
}

export interface ContextModule extends AstNode {
    readonly $container: Model;
    elements: Array<Element>
    name: QualifiedName
}

export const ContextModule = 'ContextModule';

export function isContextModule(item: unknown): item is ContextModule {
    return reflection.isInstance(item, ContextModule);
}

export interface DataType extends AstNode {
    readonly $container: ClassElement | ContextModule;
    name: string
    properties: DataTypeProperty
}

export const DataType = 'DataType';

export function isDataType(item: unknown): item is DataType {
    return reflection.isInstance(item, DataType);
}

export interface DataTypeProperty extends AstNode {
    readonly $container: DataType;
    name: string
    type: Reference<DataType>
}

export const DataTypeProperty = 'DataTypeProperty';

export function isDataTypeProperty(item: unknown): item is DataTypeProperty {
    return reflection.isInstance(item, DataTypeProperty);
}

export interface ElementReference extends AstNode {
    readonly $container: ClassElement | ContextModule;
    cardinality: Cardinality
    descriptions: Array<RelationDescription>
    firstCardinality: Cardinality
    firstEnd: Reference<ClassElement>
    hasInverse: 'inverseOf'
    inverseEnd?: Reference<ElementReference>
    isAssociation: boolean
    isComposition: boolean
    name: QualifiedName
    referencedElement: Reference<Element>
    relationType: RelationStereotype
    secondCardinality: Cardinality
    secondEnd: Reference<ClassElement>
}

export const ElementReference = 'ElementReference';

export function isElementReference(item: unknown): item is ElementReference {
    return reflection.isInstance(item, ElementReference);
}

export interface EndurantType extends AstNode {
    readonly $container: ClassElement;
    stereotype: BaseSortalStereotype | NonSortalStereotype | UltimateSortalStereotypes
}

export const EndurantType = 'EndurantType';

export function isEndurantType(item: unknown): item is EndurantType {
    return reflection.isInstance(item, EndurantType);
}

export interface EnumData extends AstNode {
    readonly $container: ClassElement | ContextModule;
    elements: Array<EnumElement>
    name: string
}

export const EnumData = 'EnumData';

export function isEnumData(item: unknown): item is EnumData {
    return reflection.isInstance(item, EnumData);
}

export interface EnumElement extends AstNode {
    readonly $container: EnumData;
    name: string
}

export const EnumElement = 'EnumElement';

export function isEnumElement(item: unknown): item is EnumElement {
    return reflection.isInstance(item, EnumElement);
}

export interface GeneralizationSet extends AstNode {
    readonly $container: ClassElement | ContextModule;
    categorizerItems: Array<Reference<Element>>
    complete: 'complete'
    disjoint: 'disjoint'
    generalItem: Array<Reference<Element>>
    name: string
    specificItems: Array<Reference<Element>>
}

export const GeneralizationSet = 'GeneralizationSet';

export function isGeneralizationSet(item: unknown): item is GeneralizationSet {
    return reflection.isInstance(item, GeneralizationSet);
}

export interface Model extends AstNode {
    elements: Array<ContextModule>
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface RelationDescription extends AstNode {
    readonly $container: ElementReference;
    name: string
}

export const RelationDescription = 'RelationDescription';

export function isRelationDescription(item: unknown): item is RelationDescription {
    return reflection.isInstance(item, RelationDescription);
}

export interface Stereotype extends AstNode {
    readonly $container: ClassPrefix;
    stereotype: 'abstract' | 'category' | 'collective' | 'enumeration' | 'event' | 'historicalRole' | 'historicalRoleMixin' | 'kind' | 'mixin' | 'mode' | 'phase' | 'phaseMixin' | 'quality' | 'quantity' | 'relator' | 'role' | 'roleMixin' | 'situation' | 'subkind' | 'type'
}

export const Stereotype = 'Stereotype';

export function isStereotype(item: unknown): item is Stereotype {
    return reflection.isInstance(item, Stereotype);
}

export type TontoAstType = 'AuxiliaryDeclarations' | 'Cardinality' | 'ClassElement' | 'ClassPrefix' | 'ContextModule' | 'DataType' | 'DataTypeProperty' | 'Element' | 'ElementReference' | 'EndurantType' | 'EnumData' | 'EnumElement' | 'GeneralizationSet' | 'Model' | 'RelationDescription' | 'Stereotype';

export type TontoAstReference = 'ClassElement:instanceOf' | 'ClassElement:specializationClasses' | 'ClassElement:specializationEndurants' | 'DataTypeProperty:type' | 'ElementReference:firstEnd' | 'ElementReference:inverseEnd' | 'ElementReference:referencedElement' | 'ElementReference:secondEnd' | 'GeneralizationSet:categorizerItems' | 'GeneralizationSet:generalItem' | 'GeneralizationSet:specificItems';

export class TontoAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['AuxiliaryDeclarations', 'Cardinality', 'ClassElement', 'ClassPrefix', 'ContextModule', 'DataType', 'DataTypeProperty', 'Element', 'ElementReference', 'EndurantType', 'EnumData', 'EnumElement', 'GeneralizationSet', 'Model', 'RelationDescription', 'Stereotype'];
    }

    isInstance(node: unknown, type: string): boolean {
        return isAstNode(node) && this.isSubtype(node.$type, type);
    }

    isSubtype(subtype: string, supertype: string): boolean {
        if (subtype === supertype) {
            return true;
        }
        switch (subtype) {
            case ClassElement:
            case AuxiliaryDeclarations: {
                return this.isSubtype(Element, supertype);
            }
            case DataType:
            case ElementReference:
            case EnumData:
            case GeneralizationSet: {
                return this.isSubtype(AuxiliaryDeclarations, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(referenceId: TontoAstReference): string {
        switch (referenceId) {
            case 'ClassElement:instanceOf': {
                return ClassElement;
            }
            case 'ClassElement:specializationClasses': {
                return ClassElement;
            }
            case 'ClassElement:specializationEndurants': {
                return ClassElement;
            }
            case 'DataTypeProperty:type': {
                return DataType;
            }
            case 'ElementReference:firstEnd': {
                return ClassElement;
            }
            case 'ElementReference:inverseEnd': {
                return ElementReference;
            }
            case 'ElementReference:referencedElement': {
                return Element;
            }
            case 'ElementReference:secondEnd': {
                return ClassElement;
            }
            case 'GeneralizationSet:categorizerItems': {
                return Element;
            }
            case 'GeneralizationSet:generalItem': {
                return Element;
            }
            case 'GeneralizationSet:specificItems': {
                return Element;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }
}

export const reflection = new TontoAstReflection();
