/******************************************************************************
 * This file was generated by langium-cli 0.4.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, Reference, isAstNode, TypeMetaData } from 'langium';

export type AuxiliaryDeclarations = DataType | ElementReference | EnumData | GeneralizationSet;

export const AuxiliaryDeclarations = 'AuxiliaryDeclarations';

export function isAuxiliaryDeclarations(item: unknown): item is AuxiliaryDeclarations {
    return reflection.isInstance(item, AuxiliaryDeclarations);
}

export type BaseSortalStereotype = 'historicalRole' | 'phase' | 'relator' | 'role' | 'subkind';

export type BasicDataTypes = 'Date' | 'number' | 'string';

export type Element = AuxiliaryDeclarations | ClassElement;

export const Element = 'Element';

export function isElement(item: unknown): item is Element {
    return reflection.isInstance(item, Element);
}

export type ElementReference = EndurantExternalReference | EndurantInternalReference;

export const ElementReference = 'ElementReference';

export function isElementReference(item: unknown): item is ElementReference {
    return reflection.isInstance(item, ElementReference);
}

export type NonSortalStereotype = 'category' | 'event' | 'historicalRoleMixin' | 'mixin' | 'phaseMixin' | 'roleMixin';

export type OntologicalNature = 'abstract' | 'collectives' | 'event' | 'extrinsic-modes' | 'functional-complex' | 'intrinsic-modes' | 'modes' | 'objects' | 'quality' | 'quantity' | 'relators' | 'type';

export type QualifiedName = string;

export type RelationStereotype = 'aggregation' | 'bringsAbout' | 'characterization' | 'comparative' | 'componentOf' | 'composition' | 'creation' | 'derivation' | 'externalDependence' | 'historicalDependence' | 'instantiation' | 'manifestation' | 'material' | 'mediation' | 'memberOf' | 'participation' | 'participational' | 'relator' | 'subCollectionOf' | 'subQuantityOf' | 'termination' | 'triggers';

export type UltimateSortalStereotypes = 'collective' | 'kind' | 'mode' | 'quality' | 'quantity';

export interface Attribute extends AstNode {
    readonly $container: ClassElement;
    attributeType: BasicDataTypes | Reference<DataType>
    name: string
}

export const Attribute = 'Attribute';

export function isAttribute(item: unknown): item is Attribute {
    return reflection.isInstance(item, Attribute);
}

export interface Cardinality extends AstNode {
    readonly $container: EndurantExternalReference | EndurantInternalReference;
    lowerBound: '*' | number
    upperBound?: '*' | number
}

export const Cardinality = 'Cardinality';

export function isCardinality(item: unknown): item is Cardinality {
    return reflection.isInstance(item, Cardinality);
}

export interface ClassElement extends AstNode {
    readonly $container: ClassElement | ContextModule;
    attributes: Array<Attribute>
    classElementType?: EndurantType | Stereotype
    instanceOf?: Reference<ClassElement>
    name: QualifiedName
    ontologicalNatures?: ElementOntologicalNature
    references: Array<ElementReference>
    specializationEndurants: Array<Reference<ClassElement>>
}

export const ClassElement = 'ClassElement';

export function isClassElement(item: unknown): item is ClassElement {
    return reflection.isInstance(item, ClassElement);
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
    properties: Array<DataTypeProperty>
}

export const DataType = 'DataType';

export function isDataType(item: unknown): item is DataType {
    return reflection.isInstance(item, DataType);
}

export interface DataTypeProperty extends AstNode {
    readonly $container: DataType;
    name: string
    type: BasicDataTypes | Reference<DataType>
}

export const DataTypeProperty = 'DataTypeProperty';

export function isDataTypeProperty(item: unknown): item is DataTypeProperty {
    return reflection.isInstance(item, DataTypeProperty);
}

export interface ElementOntologicalNature extends AstNode {
    readonly $container: ClassElement;
    natures: Array<OntologicalNature>
}

export const ElementOntologicalNature = 'ElementOntologicalNature';

export function isElementOntologicalNature(item: unknown): item is ElementOntologicalNature {
    return reflection.isInstance(item, ElementOntologicalNature);
}

export interface EndurantExternalReference extends AstNode {
    readonly $container: ClassElement | ContextModule;
    descriptions: Array<RelationDescription>
    firstCardinality?: Cardinality
    firstEnd: Reference<ClassElement>
    firstEndName?: QualifiedName
    hasInverse?: 'inverseOf'
    inverseEnd?: Reference<ElementReference>
    isAssociation: boolean
    isComposition: boolean
    isConstant: boolean
    name?: QualifiedName
    relationType?: RelationStereotype
    secondCardinality?: Cardinality
    secondEnd: Reference<ClassElement>
    secondEndName?: string
}

export const EndurantExternalReference = 'EndurantExternalReference';

export function isEndurantExternalReference(item: unknown): item is EndurantExternalReference {
    return reflection.isInstance(item, EndurantExternalReference);
}

export interface EndurantInternalReference extends AstNode {
    readonly $container: ClassElement | ContextModule;
    descriptions: Array<RelationDescription>
    firstCardinality?: Cardinality
    firstEndName?: QualifiedName
    hasInverse?: 'inverseOf'
    inverseEnd?: Reference<ElementReference>
    isAssociation: boolean
    isComposition: boolean
    isConstant: boolean
    name?: QualifiedName
    relationType?: RelationStereotype
    secondCardinality?: Cardinality
    secondEnd: Reference<ClassElement>
    secondEndName?: string
}

export const EndurantInternalReference = 'EndurantInternalReference';

export function isEndurantInternalReference(item: unknown): item is EndurantInternalReference {
    return reflection.isInstance(item, EndurantInternalReference);
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
    complete?: 'complete'
    disjoint?: 'disjoint'
    generalItem: Array<Reference<Element>>
    name: string
    specificItems: Array<Reference<Element>>
}

export const GeneralizationSet = 'GeneralizationSet';

export function isGeneralizationSet(item: unknown): item is GeneralizationSet {
    return reflection.isInstance(item, GeneralizationSet);
}

export interface Import extends AstNode {
    readonly $container: Model;
    referencedModel: Array<Reference<Model>>
}

export const Import = 'Import';

export function isImport(item: unknown): item is Import {
    return reflection.isInstance(item, Import);
}

export interface Model extends AstNode {
    imports: Array<Import>
    modules: Array<ContextModule>
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface RelationDescription extends AstNode {
    readonly $container: EndurantExternalReference | EndurantInternalReference;
    name: string
}

export const RelationDescription = 'RelationDescription';

export function isRelationDescription(item: unknown): item is RelationDescription {
    return reflection.isInstance(item, RelationDescription);
}

export interface Stereotype extends AstNode {
    readonly $container: ClassElement;
    stereotype: BaseSortalStereotype | NonSortalStereotype | UltimateSortalStereotypes
}

export const Stereotype = 'Stereotype';

export function isStereotype(item: unknown): item is Stereotype {
    return reflection.isInstance(item, Stereotype);
}

export type TontoAstType = 'Attribute' | 'AuxiliaryDeclarations' | 'Cardinality' | 'ClassElement' | 'ContextModule' | 'DataType' | 'DataTypeProperty' | 'Element' | 'ElementOntologicalNature' | 'ElementReference' | 'EndurantExternalReference' | 'EndurantInternalReference' | 'EndurantType' | 'EnumData' | 'EnumElement' | 'GeneralizationSet' | 'Import' | 'Model' | 'RelationDescription' | 'Stereotype';

export type TontoAstReference = 'Attribute:attributeType' | 'ClassElement:instanceOf' | 'ClassElement:specializationEndurants' | 'DataTypeProperty:type' | 'EndurantExternalReference:firstEnd' | 'EndurantExternalReference:inverseEnd' | 'EndurantExternalReference:secondEnd' | 'EndurantInternalReference:inverseEnd' | 'EndurantInternalReference:secondEnd' | 'GeneralizationSet:categorizerItems' | 'GeneralizationSet:generalItem' | 'GeneralizationSet:specificItems' | 'Import:referencedModel';

export class TontoAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['Attribute', 'AuxiliaryDeclarations', 'Cardinality', 'ClassElement', 'ContextModule', 'DataType', 'DataTypeProperty', 'Element', 'ElementOntologicalNature', 'ElementReference', 'EndurantExternalReference', 'EndurantInternalReference', 'EndurantType', 'EnumData', 'EnumElement', 'GeneralizationSet', 'Import', 'Model', 'RelationDescription', 'Stereotype'];
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
            case EnumData:
            case GeneralizationSet:
            case ElementReference: {
                return this.isSubtype(AuxiliaryDeclarations, supertype);
            }
            case EndurantExternalReference:
            case EndurantInternalReference: {
                return this.isSubtype(ElementReference, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(referenceId: TontoAstReference): string {
        switch (referenceId) {
            case 'Attribute:attributeType': {
                return DataType;
            }
            case 'ClassElement:instanceOf': {
                return ClassElement;
            }
            case 'ClassElement:specializationEndurants': {
                return ClassElement;
            }
            case 'DataTypeProperty:type': {
                return DataType;
            }
            case 'EndurantExternalReference:firstEnd': {
                return ClassElement;
            }
            case 'EndurantExternalReference:inverseEnd': {
                return ElementReference;
            }
            case 'EndurantExternalReference:secondEnd': {
                return ClassElement;
            }
            case 'EndurantInternalReference:inverseEnd': {
                return ElementReference;
            }
            case 'EndurantInternalReference:secondEnd': {
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
            case 'Import:referencedModel': {
                return Model;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'ClassElement': {
                return {
                    name: 'ClassElement',
                    mandatory: [
                        { name: 'attributes', type: 'array' },
                        { name: 'references', type: 'array' },
                        { name: 'specializationEndurants', type: 'array' }
                    ]
                };
            }
            case 'ContextModule': {
                return {
                    name: 'ContextModule',
                    mandatory: [
                        { name: 'elements', type: 'array' }
                    ]
                };
            }
            case 'DataType': {
                return {
                    name: 'DataType',
                    mandatory: [
                        { name: 'properties', type: 'array' }
                    ]
                };
            }
            case 'ElementOntologicalNature': {
                return {
                    name: 'ElementOntologicalNature',
                    mandatory: [
                        { name: 'natures', type: 'array' }
                    ]
                };
            }
            case 'EndurantExternalReference': {
                return {
                    name: 'EndurantExternalReference',
                    mandatory: [
                        { name: 'descriptions', type: 'array' },
                        { name: 'isAssociation', type: 'boolean' },
                        { name: 'isComposition', type: 'boolean' },
                        { name: 'isConstant', type: 'boolean' }
                    ]
                };
            }
            case 'EndurantInternalReference': {
                return {
                    name: 'EndurantInternalReference',
                    mandatory: [
                        { name: 'descriptions', type: 'array' },
                        { name: 'isAssociation', type: 'boolean' },
                        { name: 'isComposition', type: 'boolean' },
                        { name: 'isConstant', type: 'boolean' }
                    ]
                };
            }
            case 'EnumData': {
                return {
                    name: 'EnumData',
                    mandatory: [
                        { name: 'elements', type: 'array' }
                    ]
                };
            }
            case 'GeneralizationSet': {
                return {
                    name: 'GeneralizationSet',
                    mandatory: [
                        { name: 'categorizerItems', type: 'array' },
                        { name: 'generalItem', type: 'array' },
                        { name: 'specificItems', type: 'array' }
                    ]
                };
            }
            case 'Import': {
                return {
                    name: 'Import',
                    mandatory: [
                        { name: 'referencedModel', type: 'array' }
                    ]
                };
            }
            case 'Model': {
                return {
                    name: 'Model',
                    mandatory: [
                        { name: 'imports', type: 'array' },
                        { name: 'modules', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}

export const reflection = new TontoAstReflection();
