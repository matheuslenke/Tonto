grammar Tonto

interface Model {
	imports: Import[];
	modules: ContextModule[];
}

entry RModel returns Model:
	imports+=Import*
	modules+=ContextModule*
;

// <--- Criação de Módulos --->
// interface IContextModule {
//     name: string;
// 	elements: Element[];
// }

/*
* ContextModule is the main declaration of a module, that wraps a context of elements. All declarations should
* go inside this declaration
*/
ContextModule:
	'module' name=ID '{'
		elements+=Element*
	'}'
;

QualifiedName returns string:
	ID ('.' ID)*
;

Import:
	'import' referencedModel+=[Model:ID]
;

// <--- Elementos e classes --->

Element:
	ClassElement | AuxiliaryDeclarations
;

ClassElement:
    Class | Endurant | CustomType
;

AuxiliaryDeclarations:
	DataType | EnumData | GeneralizationSet | ElementRelation
;

CustomType infers ClassElement:
	'type' name=QualifiedName ('{' 
	'}')?
;

/*
* Stereotype is created so users can use the class syntax that is more similar to what OntoUML was doing as an extension of UML
*/

Class infers ClassElement:
	('@' classElementType=EndurantType)?
	'class' name=QualifiedName 
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassElement:QualifiedName] ')')?
	('specializes' specializationEndurants+=[ClassElement:QualifiedName]
	(',' specializationEndurants+=[ClassElement:QualifiedName])? 
	)? ('{'
		(attributes+=Attribute |
		references+=ElementRelation
		)*
    '}')?
;

Endurant infers ClassElement:
    classElementType=EndurantType name=QualifiedName 
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassElement:QualifiedName] ')')?
	('specializes' specializationEndurants+=[ClassElement:QualifiedName]
	(',' specializationEndurants+=[ClassElement:QualifiedName])? 
	)? ('{'
		(attributes+=Attribute |
		references+=ElementRelation
		)*
    '}')?
;

EndurantType:
    stereotype=(NonSortalStereotype | UltimateSortalStereotypes | BaseSortalStereotype)
;

NonSortalStereotype returns string:
	'category' | 'mixin' | 'phaseMixin' | 'roleMixin' | 'historicalRoleMixin' | 'event'
;

UltimateSortalStereotypes returns string:
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode'
;

BaseSortalStereotype returns string:
	'subkind' | 'phase' | 'role' | 'historicalRole' | 'relator'
;

ElementOntologicalNature:
	'of' natures+=OntologicalNature (',' natures+=OntologicalNature)*
;

OntologicalNature returns string:
	'objects' | 'relators' | 'modes' |
	'collectives' | 'functional-complexes' |
	'quantities' | 'intrinsic-modes' | 'extrinsic-modes' |
	'qualities' | 'types' | 'abstracts' | 'events'
;

ElementRelation: 
	InternalRelation | ExternalRelation
;

InternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?

	// 1. First end name and Meta Attributes option one
	(	('(' firstEndName=ID ')') &
		('{' firstEndMetaAttributes+=RelationMetaAttribute 
		(',' firstEndMetaAttributes+=RelationMetaAttribute )* '}')
	)?

    firstCardinality=Cardinality?
	(isAssociation?='--' (name=QualifiedName ('specializes' specializeRelation=[ElementRelation:QualifiedName])? '--')? 
	| 
	isComposition?='<>--' (name=QualifiedName ('specializes' specializeRelation=[ElementRelation:QualifiedName])? '<>--')? )
	secondCardinality=Cardinality? 

	(	('{' secondEndMetaAttributes+=RelationMetaAttribute 
		(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')
		&
		('(' secondEndName=ID ')')
	)?

	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
 ;

ExternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?
	'relation'

	(	('(' firstEndName=ID ')')
		&
		('{' firstEndMetaAttributes+=RelationMetaAttribute 
		(',' firstEndMetaAttributes+=RelationMetaAttribute )* '}')
	)
	
    firstEnd=[ClassElement:QualifiedName]
	firstCardinality=Cardinality?
	(isAssociation?='--' (name=QualifiedName ('specializes' specializeRelation=[ElementRelation:QualifiedName])? '--')? 
	| 
	isComposition?='<>--' (name=QualifiedName ('specializes' specializeRelation=[ElementRelation:QualifiedName])? '<>--')? )
	    secondCardinality=Cardinality? 

	(	('(' secondEndName=ID ')')
		&
		('{' secondEndMetaAttributes+=RelationMetaAttribute 
		(',' secondEndMetaAttributes+=RelationMetaAttribute )* '}')
	)

	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

Attribute:
 	name=ID ':' (attributeType=[DataType] | attributeType=BasicDataTypes)
	cardinality=Cardinality?
	('{' isOrdered?='ordered' & isConst?='const' '}')?
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
	'relator' |
	'inherence' | 
	'value' | 
	'formal'
;

// Relator:
//     'relator' name=QualifiedName ('{' 
//         references=InternalRelation*
//     '}')?
// ;

Cardinality:
	'[' lowerBound=(INT | '*') 
	('..' upperBound=(INT | '*'))? ']'
;

// <--- Generalization Set --->

GeneralizationSet:
	(disjoint='disjoint')? (complete='complete')?
	'genset' name=ID '{' 
		'general' generalItem+=[Element:QualifiedName] (',' generalItem+=[Element:QualifiedName])*
		('categorizer' categorizerItems+=[Element:QualifiedName] (categorizerItems+=[Element:QualifiedName])*)?
		'specifics' specificItems+=[Element:QualifiedName] (',' specificItems+=[Element:QualifiedName])*
	'}'
;

// <--- DataTypes --->

DataType:
	'datatype' name=ID ('{'
		properties+=DataTypeProperty*
	'}')?
;

DataTypeProperty:
	name=ID ':' (type=[DataType] | type=BasicDataTypes) 
	cardinality=Cardinality?
	('{' isOrdered?='ordered' & isConst?='const' '}')?
;

BasicDataTypes returns string:
	'number' | 'string' | 'Date' | 'boolean'
;

// <--- Enums --->

EnumData:
	'enum' name=ID '{'
		elements+=EnumElement
		(',' elements+=EnumElement)*
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