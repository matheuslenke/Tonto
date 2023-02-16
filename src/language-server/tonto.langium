grammar Tonto

interface Model {
	imports: Import[];
	modules: ContextModule[];
}

entry RModel returns Model:
  imports+=Import*
	modules+=ContextModule*
;

/*
* ContextModule is the main declaration of a module, that wraps a context of elements. All declarations should
* go inside this declaration
*/
ContextModule:
  'module' name=ID '{'
		declarations+=Declaration*
		modules+=ContextModule*
	'}'
;

QualifiedName returns string:
  ID ('.' ID)*
;

Import:
  'import' referencedModel+=[Model:ID]
;

// <--- Declarations --->

Declaration:
  ClassDeclaration | AuxiliaryDeclaration
;

AuxiliaryDeclaration:
  ComplexDataType | Enum | GeneralizationSetImpl | ElementRelation
;

interface Generalization {
    general: @ClassDeclarationOrRelation
    specifics: @ClassDeclarationOrRelation[]
}

ClassDeclaration:
  classElementType=OntologicalCategory name=QualifiedName
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassDeclaration:QualifiedName] ')')?
     ('specializes' specializationEndurants+=[ClassDeclaration:QualifiedName]
	(',' specializationEndurants+=[ClassDeclaration:QualifiedName])?
	)? ('{'
		(attributes+=Attribute |
		references+=ElementRelation
		)*
    '}')?
;

OntologicalCategory:
  ontologicalCategory=(UnspecifiedType | NonEndurantType | EndurantType)
;

UnspecifiedType returns string:
  'class'
;

NonEndurantType returns string:
  'event' | 'situation'
;

EndurantType returns string:
  NonSortal | UltimateSortal | Sortal;


NonSortal returns string:
  'category' | 'mixin' | 'phaseMixin' | 'roleMixin' | 'historicalRoleMixin'
;

UltimateSortal returns string:
  'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator' | 'type'
  // do we keep mode here?
;

Sortal returns string:
  'subkind' | 'phase' | 'role' | 'historicalRole'
;

ElementOntologicalNature:
  'of' natures+=OntologicalNature (',' natures+=OntologicalNature)*
;

OntologicalNature returns string:
  'objects' | 'functional-complexes' | 'collectives'  | 'quantities' |
    'relators' | 'intrinsic-modes' | 'extrinsic-modes' | 'qualities' |
    'events' | 'situations' |  'types' | 'abstracts'
  // Note: 'objects' = 'functional-complexes' or 'collectives' or 'quantities'
;

ElementRelation:
  InternalRelation | ExternalRelation
;

InternalRelation infers ElementRelation:
  ('@'relationType=RelationStereotype)?
	    (
		'('
		(firstEndName=ID) &
		('{' firstEndMetaAttributes+=RelationMetaAttribute
		(',' firstEndMetaAttributes+=RelationMetaAttribute )* '}')
		')'
	)?

	firstCardinality=Cardinality?
	(
		(isAssociation?='--' | isComposition?='<>--') (name=QualifiedName '--')?
	)?

	secondCardinality=Cardinality?
	secondEnd=[ClassDeclaration:QualifiedName]
	(
		'('
			(secondEndName=ID)
			&
			('{' secondEndMetaAttributes+=RelationMetaAttribute
			(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')
		')'
	)?
	('specializes' specializeRelation=[ElementRelation:QualifiedName])?
    (hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

ExternalRelation infers ElementRelation:
  ('@'relationType=RelationStereotype)?
	'relation'
    firstEnd=[ClassDeclaration:QualifiedName]
	    (
		'('
		(firstEndName=ID) &
		('{' firstEndMetaAttributes+=RelationMetaAttribute
		(',' firstEndMetaAttributes+=RelationMetaAttribute )* '}')
		')'
	)?

	firstCardinality=Cardinality?
	(
		(isAssociation?='--' | isComposition?='<>--') (name=QualifiedName '--')?
	)?

	secondCardinality=Cardinality?
	secondEnd=[ClassDeclaration:QualifiedName]
	(
		'('
			(secondEndName=ID)
			&
			('{' secondEndMetaAttributes+=RelationMetaAttribute
			(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')
		')'
	)?
	('specializes' specializeRelation=[ElementRelation:QualifiedName])?
    (hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

Attribute:
  name=ID ':' (attributeTypeRef=[ComplexDataType] | attributeType=BasicDataType)
	cardinality=Cardinality?
	('{'((isOrdered?='ordered') & (isConst?='const') & (isDerived?='derived'))? '}')?
;

RelationMetaAttribute:
  isOrdered?='ordered' | isConst?='const' | isDerived?='derived' |
	('subsets' subsetRelation=[ElementRelation:QualifiedName] ) |
	('redefines' redefinesRelation=[ElementRelation:QualifiedName] )
;

RelationStereotype returns string:
  'material' |
	'derivation' |
	'comparative' |
	'mediation' |
	'characterization' |
	'externalDependence' |
	'componentOf' |
	'memberOf' |
	'subCollectionOf' |
	'subQuantityOf' |
	'instantiation' |
	'termination' |
	'participational' |
	'participation' |
	'historicalDependence' |
	'creation' |
	'manifestation' |
	'bringsAbout' |
	'triggers' |
	'composition' |
	'aggregation' |
	'inherence' |
	'value' |
	'formal'
;

Cardinality:
  '[' lowerBound=(INT | '*')
	('..' upperBound=(INT | '*'))? ']'
;

// <--- Generalization Set --->

interface GeneralizationSet {
    disjoint: boolean
    complete: boolean
    name: string
    generalItem: @ClassDeclarationOrRelation
    categorizerItems: @ClassDeclarationOrRelation[]
    specificItems: @ClassDeclarationOrRelation[]
}

GeneralizationSetImpl returns GeneralizationSet:
  (disjoint?='disjoint')? (complete?='complete')?
	'genset' name=ID '{'
        GeneralizationSetGeneral
        GeneralizationSetCategorizer?
        GeneralizationSetSpecifics
	'}'
;

type ClassDeclarationOrRelation = ClassDeclaration | ElementRelation;

fragment GeneralizationSetGeneral:
  'general' generalItem=[ClassDeclarationOrRelation:QualifiedName]
;

fragment GeneralizationSetCategorizer:
  'categorizer' categorizerItems+=[ClassDeclarationOrRelation:QualifiedName]
;

fragment GeneralizationSetSpecifics:
  'specifics' specificItems+=[ClassDeclarationOrRelation:QualifiedName]
        (',' specificItems+=[ClassDeclarationOrRelation:QualifiedName])*
;

// <--- DataTypes --->

ComplexDataType:
  'datatype' name=ID ontologicalNature=ElementOntologicalNature? ('{'
		(attributes+=Attribute)*
	'}')?
;

BasicDataType returns string:
  'number' | 'string' | 'date' | 'boolean'
;

// <--- Enums --->

Enum:
  'enum' name=ID '{'
		(elements+=EnumElement
		((',' | '\n') elements+=EnumElement)*)?
	'}'
;

EnumElement:
  name=ID
;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
