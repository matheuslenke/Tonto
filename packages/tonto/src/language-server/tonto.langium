grammar Tonto

interface Model {
	imports: Import[];
	module: ContextModule;
}

entry RModel returns Model:
	imports+=Import*
	module=ContextModule
;

/**
 * Package declaration
 */

/**
 * ContextModule is the main declaration of a module, that wraps a context of elements. All declarations should
 * go inside this declaration
 */
ContextModule:
	(isGlobal?='global')? 'package' (name=QualifiedName | name=STRING)

	declarations+=Declaration*
;

QualifiedName returns string:
	ID ('.' ID)*
;

Import:
	'import' referencedModel=[ContextModule:QualifiedName] ('as' packageAlias=ID)?
;

// <--- Declarations --->

Declaration:
	ClassDeclarationRule | AuxiliaryDeclaration
;

AuxiliaryDeclaration:
	DataType | Enum | GeneralizationSetImpl | ExternalRelation
;

interface Generalization {
    general: @ClassDeclarationOrRelation
    specifics: @ClassDeclarationOrRelation[]
}

interface ClassDeclaration {
	classElementType: OntologicalCategory;
	name: string;
	ontologicalNatures?: ElementOntologicalNature;
	instanceOf?: @ClassDeclaration;
	specializationEndurants: @ClassDeclaration[];
	attributes: Attribute[];
	references: ElementRelation[];
}

ClassDeclarationRule returns ClassDeclaration:
	classElementType=OntologicalCategory name=QualifiedName
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassDeclaration:QualifiedName] ')')?
    ('specializes' specializationEndurants+=[ClassDeclaration:QualifiedName]
		(',' specializationEndurants+=[ClassDeclaration:QualifiedName])?
		)? 
		('{'
			(attributes+=Attribute |
			references+=InternalRelation)*
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
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator' | 'type' | 'powertype'
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
    'events' | 'situations' |  'types' | 'abstract-individuals'
  // Note: 'objects' = 'functional-complexes' or 'collectives' or 'quantities'
;

ElementRelation:
	InternalRelation | ExternalRelation
;

InternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?
	(
		'('
			('{' metaAttributes+=RelationMetaAttribute 
			(',' metaAttributes+=RelationMetaAttribute )* '}')?
			(firstEndName=ID)?
		')'
	)?
	firstCardinality=Cardinality?
	(isAssociation?='--' | isAggregation?='<>--' | isComposition?='<o>--') (name=QualifiedName '--')?

	secondCardinality=Cardinality?
	(
		'('
			('{' secondEndMetaAttributes+=RelationMetaAttribute
			(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')?
			(secondEndName=ID)?
		')'
	)?

	secondEnd=[ClassDeclaration:ID]
	('specializes' specializeRelation=[ElementRelation:QualifiedName])?
  (hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

ExternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?
	'relation'
    firstEnd=[ClassDeclaration:QualifiedName]
	(
		'('
		('{' firstEndMetaAttributes+=RelationMetaAttribute
		(',' firstEndMetaAttributes+=RelationMetaAttribute )* '}')?
		(firstEndName=ID)?
		')'
	)?

	firstCardinality=Cardinality?
	(isAssociation?='--' | isComposition?='<>--' | isComposition?='<o>--') (name=QualifiedName '--')?

	secondCardinality=Cardinality?
	(
		'('
			('{' secondEndMetaAttributes+=RelationMetaAttribute
			(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')?
			(secondEndName=ID)?
		')'
	)?

	secondEnd=[ClassDeclaration:ID]
	('specializes' specializeRelation=[ElementRelation:QualifiedName])?
	(hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

Attribute:
	name=ID ':' attributeTypeRef=[DataType:QualifiedName]
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
	// TODO: Change to unordered group when Langium supports it
	// Case 1
			(
				'general' generalItem=[ClassDeclarationOrRelation:QualifiedName]
				('categorizer' categorizerItems+=[ClassDeclarationOrRelation:QualifiedName])?
				'specifics' specificItems+=[ClassDeclarationOrRelation:QualifiedName]
				(',' specificItems+=[ClassDeclarationOrRelation:QualifiedName])*
			)
	'}'
;

type ClassDeclarationOrRelation = ClassDeclaration | ElementRelation;

// <--- DataTypes --->

type DataTypeOrClass = DataType | ClassDeclaration;

DataType:
	'datatype' name=ID ontologicalNature=ElementOntologicalNature? 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(attributes+=Attribute)*
	'}')?
;

// <--- Enums --->

Enum infers DataType:
	isEnum?='enum' name=ID 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	'{'
		(elements+=EnumElement
		((',') elements+=EnumElement)*)?
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
