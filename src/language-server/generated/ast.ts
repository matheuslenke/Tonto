/******************************************************************************
 * This file was generated by langium-cli 1.1.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable */
import { AstNode, AbstractAstReflection, Reference, ReferenceInfo, TypeMetaData } from 'langium';

export type AuxiliaryDeclaration = ComplexDataType | ElementRelation | Enum | GeneralizationSet;

export const AuxiliaryDeclaration = 'AuxiliaryDeclaration';

export function isAuxiliaryDeclaration(item: unknown): item is AuxiliaryDeclaration {
    return reflection.isInstance(item, AuxiliaryDeclaration);
}

export type BasicDataType = 'boolean' | 'date' | 'number' | 'string';

export type ClassDeclarationOrRelation = ClassDeclaration | ElementRelation;

export const ClassDeclarationOrRelation = 'ClassDeclarationOrRelation';

export function isClassDeclarationOrRelation(item: unknown): item is ClassDeclarationOrRelation {
    return reflection.isInstance(item, ClassDeclarationOrRelation);
}

export type Declaration = AuxiliaryDeclaration | ClassDeclaration;

export const Declaration = 'Declaration';

export function isDeclaration(item: unknown): item is Declaration {
    return reflection.isInstance(item, Declaration);
}

export type EndurantType = NonSortal | Sortal | UltimateSortal;

export type NonEndurantType = 'event' | 'situation';

export type NonSortal = 'category' | 'historicalRoleMixin' | 'mixin' | 'phaseMixin' | 'roleMixin';

export type OntologicalNature = 'abstracts' | 'collectives' | 'events' | 'extrinsic-modes' | 'functional-complexes' | 'intrinsic-modes' | 'objects' | 'qualities' | 'quantities' | 'relators' | 'situations' | 'types';

export type QualifiedName = string;

export type RelationStereotype = 'aggregation' | 'bringsAbout' | 'characterization' | 'comparative' | 'componentOf' | 'composition' | 'creation' | 'derivation' | 'externalDependence' | 'formal' | 'historicalDependence' | 'inherence' | 'instantiation' | 'manifestation' | 'material' | 'mediation' | 'memberOf' | 'participation' | 'participational' | 'subCollectionOf' | 'subQuantityOf' | 'termination' | 'triggers' | 'value';

export type Sortal = 'historicalRole' | 'phase' | 'role' | 'subkind';

export type UltimateSortal = 'collective' | 'extrinsicMode' | 'intrinsicMode' | 'kind' | 'mode' | 'quality' | 'quantity' | 'relator' | 'type';

export type UnspecifiedType = 'class';

export interface Attribute extends AstNode {
    readonly $container: ClassDeclaration | ComplexDataType;
    readonly $type: 'Attribute';
    attributeType?: BasicDataType
    attributeTypeRef?: Reference<ComplexDataType>
    cardinality?: Cardinality
    isConst: boolean
    isDerived: boolean
    isOrdered: boolean
    name: string
}

export const Attribute = 'Attribute';

export function isAttribute(item: unknown): item is Attribute {
    return reflection.isInstance(item, Attribute);
}

export interface Cardinality extends AstNode {
    readonly $container: Attribute | ElementRelation;
    readonly $type: 'Cardinality';
    lowerBound: '*' | number
    upperBound?: '*' | number
}

export const Cardinality = 'Cardinality';

export function isCardinality(item: unknown): item is Cardinality {
    return reflection.isInstance(item, Cardinality);
}

export interface ClassDeclaration extends AstNode {
    readonly $container: ClassDeclaration | ContextModule;
    readonly $type: 'ClassDeclaration';
    attributes: Array<Attribute>
    classElementType: OntologicalCategory
    instanceOf?: Reference<ClassDeclaration>
    name: QualifiedName
    ontologicalNatures?: ElementOntologicalNature
    references: Array<ElementRelation>
    specializationEndurants: Array<Reference<ClassDeclaration>>
}

export const ClassDeclaration = 'ClassDeclaration';

export function isClassDeclaration(item: unknown): item is ClassDeclaration {
    return reflection.isInstance(item, ClassDeclaration);
}

export interface ComplexDataType extends AstNode {
    readonly $container: ClassDeclaration | ContextModule;
    readonly $type: 'ComplexDataType';
    attributes: Array<Attribute>
    name: string
    ontologicalNature?: ElementOntologicalNature
}

export const ComplexDataType = 'ComplexDataType';

export function isComplexDataType(item: unknown): item is ComplexDataType {
    return reflection.isInstance(item, ComplexDataType);
}

export interface ContextModule extends AstNode {
    readonly $container: ContextModule | Model;
    readonly $type: 'ContextModule';
    declarations: Array<Declaration>
    modules: Array<ContextModule>
    name: QualifiedName
    stringName?: string
}

export const ContextModule = 'ContextModule';

export function isContextModule(item: unknown): item is ContextModule {
    return reflection.isInstance(item, ContextModule);
}

export interface ElementOntologicalNature extends AstNode {
    readonly $container: ClassDeclaration | ComplexDataType;
    readonly $type: 'ElementOntologicalNature';
    natures: Array<OntologicalNature>
}

export const ElementOntologicalNature = 'ElementOntologicalNature';

export function isElementOntologicalNature(item: unknown): item is ElementOntologicalNature {
    return reflection.isInstance(item, ElementOntologicalNature);
}

export interface ElementRelation extends AstNode {
    readonly $container: ClassDeclaration | ContextModule;
    readonly $type: 'ElementRelation';
    cardinality?: Cardinality
    firstCardinality?: Cardinality
    firstEnd?: Reference<ClassDeclaration>
    firstEndMetaAttributes: Array<RelationMetaAttribute>
    firstEndName?: string
    hasInverse?: 'inverseOf'
    inverseEnd?: Reference<ElementRelation>
    isAssociation: boolean
    isComposition: boolean
    metaAttributes: Array<RelationMetaAttribute>
    name?: QualifiedName
    relationType?: RelationStereotype
    secondCardinality?: Cardinality
    secondEnd: Reference<ClassDeclaration>
    secondEndMetaAttributes: Array<RelationMetaAttribute>
    secondEndName?: string
    specializeRelation?: Reference<ElementRelation>
}

export const ElementRelation = 'ElementRelation';

export function isElementRelation(item: unknown): item is ElementRelation {
    return reflection.isInstance(item, ElementRelation);
}

export interface Enum extends AstNode {
    readonly $container: ClassDeclaration | ContextModule;
    readonly $type: 'Enum';
    elements: Array<EnumElement>
    name: string
}

export const Enum = 'Enum';

export function isEnum(item: unknown): item is Enum {
    return reflection.isInstance(item, Enum);
}

export interface EnumElement extends AstNode {
    readonly $container: Enum;
    readonly $type: 'EnumElement';
    name: string
}

export const EnumElement = 'EnumElement';

export function isEnumElement(item: unknown): item is EnumElement {
    return reflection.isInstance(item, EnumElement);
}

export interface Generalization extends AstNode {
    readonly $type: 'Generalization';
    general: Reference<ClassDeclarationOrRelation>
    specifics: Array<Reference<ClassDeclarationOrRelation>>
}

export const Generalization = 'Generalization';

export function isGeneralization(item: unknown): item is Generalization {
    return reflection.isInstance(item, Generalization);
}

export interface GeneralizationSet extends AstNode {
    readonly $container: ClassDeclaration | ContextModule;
    readonly $type: 'GeneralizationSet';
    categorizerItems: Array<Reference<ClassDeclarationOrRelation>>
    complete: boolean
    disjoint: boolean
    generalItem: Reference<ClassDeclarationOrRelation>
    name: string
    specificItems: Array<Reference<ClassDeclarationOrRelation>>
}

export const GeneralizationSet = 'GeneralizationSet';

export function isGeneralizationSet(item: unknown): item is GeneralizationSet {
    return reflection.isInstance(item, GeneralizationSet);
}

export interface Import extends AstNode {
    readonly $container: Model;
    readonly $type: 'Import';
    referencedModel: Reference<ContextModule>
}

export const Import = 'Import';

export function isImport(item: unknown): item is Import {
    return reflection.isInstance(item, Import);
}

export interface Model extends AstNode {
    readonly $type: 'Model';
    imports: Array<Import>
    module: ContextModule
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface OntologicalCategory extends AstNode {
    readonly $container: ClassDeclaration;
    readonly $type: 'OntologicalCategory';
    ontologicalCategory: EndurantType | NonEndurantType | UnspecifiedType
}

export const OntologicalCategory = 'OntologicalCategory';

export function isOntologicalCategory(item: unknown): item is OntologicalCategory {
    return reflection.isInstance(item, OntologicalCategory);
}

export interface RelationMetaAttribute extends AstNode {
    readonly $container: ElementRelation;
    readonly $type: 'RelationMetaAttribute';
    isConst: boolean
    isDerived: boolean
    isOrdered: boolean
    redefinesRelation?: Reference<ElementRelation>
    subsetRelation?: Reference<ElementRelation>
}

export const RelationMetaAttribute = 'RelationMetaAttribute';

export function isRelationMetaAttribute(item: unknown): item is RelationMetaAttribute {
    return reflection.isInstance(item, RelationMetaAttribute);
}

export interface TontoAstType {
    Attribute: Attribute
    AuxiliaryDeclaration: AuxiliaryDeclaration
    Cardinality: Cardinality
    ClassDeclaration: ClassDeclaration
    ClassDeclarationOrRelation: ClassDeclarationOrRelation
    ComplexDataType: ComplexDataType
    ContextModule: ContextModule
    Declaration: Declaration
    ElementOntologicalNature: ElementOntologicalNature
    ElementRelation: ElementRelation
    Enum: Enum
    EnumElement: EnumElement
    Generalization: Generalization
    GeneralizationSet: GeneralizationSet
    Import: Import
    Model: Model
    OntologicalCategory: OntologicalCategory
    RelationMetaAttribute: RelationMetaAttribute
}

export class TontoAstReflection extends AbstractAstReflection {

    getAllTypes(): string[] {
        return ['Attribute', 'AuxiliaryDeclaration', 'Cardinality', 'ClassDeclaration', 'ClassDeclarationOrRelation', 'ComplexDataType', 'ContextModule', 'Declaration', 'ElementOntologicalNature', 'ElementRelation', 'Enum', 'EnumElement', 'Generalization', 'GeneralizationSet', 'Import', 'Model', 'OntologicalCategory', 'RelationMetaAttribute'];
    }

    protected override computeIsSubtype(subtype: string, supertype: string): boolean {
        switch (subtype) {
            case AuxiliaryDeclaration: {
                return this.isSubtype(Declaration, supertype);
            }
            case ClassDeclaration: {
                return this.isSubtype(ClassDeclarationOrRelation, supertype) || this.isSubtype(Declaration, supertype);
            }
            case ComplexDataType:
            case Enum:
            case GeneralizationSet: {
                return this.isSubtype(AuxiliaryDeclaration, supertype);
            }
            case ElementRelation: {
                return this.isSubtype(AuxiliaryDeclaration, supertype) || this.isSubtype(ClassDeclarationOrRelation, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Attribute:attributeTypeRef': {
                return ComplexDataType;
            }
            case 'ClassDeclaration:instanceOf':
            case 'ClassDeclaration:specializationEndurants':
            case 'ElementRelation:firstEnd':
            case 'ElementRelation:secondEnd': {
                return ClassDeclaration;
            }
            case 'ElementRelation:inverseEnd':
            case 'ElementRelation:specializeRelation':
            case 'RelationMetaAttribute:redefinesRelation':
            case 'RelationMetaAttribute:subsetRelation': {
                return ElementRelation;
            }
            case 'Generalization:general':
            case 'Generalization:specifics':
            case 'GeneralizationSet:categorizerItems':
            case 'GeneralizationSet:generalItem':
            case 'GeneralizationSet:specificItems': {
                return ClassDeclarationOrRelation;
            }
            case 'Import:referencedModel': {
                return ContextModule;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'Attribute': {
                return {
                    name: 'Attribute',
                    mandatory: [
                        { name: 'isConst', type: 'boolean' },
                        { name: 'isDerived', type: 'boolean' },
                        { name: 'isOrdered', type: 'boolean' }
                    ]
                };
            }
            case 'ClassDeclaration': {
                return {
                    name: 'ClassDeclaration',
                    mandatory: [
                        { name: 'attributes', type: 'array' },
                        { name: 'references', type: 'array' },
                        { name: 'specializationEndurants', type: 'array' }
                    ]
                };
            }
            case 'ComplexDataType': {
                return {
                    name: 'ComplexDataType',
                    mandatory: [
                        { name: 'attributes', type: 'array' }
                    ]
                };
            }
            case 'ContextModule': {
                return {
                    name: 'ContextModule',
                    mandatory: [
                        { name: 'declarations', type: 'array' },
                        { name: 'modules', type: 'array' }
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
            case 'ElementRelation': {
                return {
                    name: 'ElementRelation',
                    mandatory: [
                        { name: 'firstEndMetaAttributes', type: 'array' },
                        { name: 'isAssociation', type: 'boolean' },
                        { name: 'isComposition', type: 'boolean' },
                        { name: 'metaAttributes', type: 'array' },
                        { name: 'secondEndMetaAttributes', type: 'array' }
                    ]
                };
            }
            case 'Enum': {
                return {
                    name: 'Enum',
                    mandatory: [
                        { name: 'elements', type: 'array' }
                    ]
                };
            }
            case 'Generalization': {
                return {
                    name: 'Generalization',
                    mandatory: [
                        { name: 'specifics', type: 'array' }
                    ]
                };
            }
            case 'GeneralizationSet': {
                return {
                    name: 'GeneralizationSet',
                    mandatory: [
                        { name: 'categorizerItems', type: 'array' },
                        { name: 'complete', type: 'boolean' },
                        { name: 'disjoint', type: 'boolean' },
                        { name: 'specificItems', type: 'array' }
                    ]
                };
            }
            case 'Model': {
                return {
                    name: 'Model',
                    mandatory: [
                        { name: 'imports', type: 'array' }
                    ]
                };
            }
            case 'RelationMetaAttribute': {
                return {
                    name: 'RelationMetaAttribute',
                    mandatory: [
                        { name: 'isConst', type: 'boolean' },
                        { name: 'isDerived', type: 'boolean' },
                        { name: 'isOrdered', type: 'boolean' }
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
