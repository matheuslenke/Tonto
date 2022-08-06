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
	DataType | EnumData | GeneralizationSet | ElementReference
;

CustomType infers ClassElement:
	'type' name=QualifiedName ('{' 
	'}')?
;

/*
* Stereotype is created so users can use the class syntax that is more similar to what OntoUML was doing as an extension of UML
*/
Stereotype:
	'@' stereotype=(NonSortalStereotype | UltimateSortalStereotypes | BaseSortalStereotype)
;

Class infers ClassElement:
	classElementType=Stereotype? 'class' name=QualifiedName 
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassElement:QualifiedName] ')')?
	('specializes' specializationEndurants+=[ClassElement:QualifiedName]
	(',' specializationEndurants+=[ClassElement:QualifiedName])? 
	)? ('{'
		(attributes+=Attribute |
		references+=ElementReference
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
		references+=ElementReference
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
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsic' 'mode' | 'extrinsic' 'mode'
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

ElementReference: 
	InternalRelation | ExternalRelation
;

InternalRelation:
	('@'relationType=RelationStereotype)?
	('(' firstEndName=ID ')')?
		('{' firstEndMetaAttributes+=RelationMetaAttribute 
		(',' firstEndMetaAttributes+=RelationMetaAttribute )*
	'}')?
    firstCardinality=Cardinality?

	(isAssociation?='--' (name=QualifiedName '--')? 
	| 
	isComposition?='<>--' (name=QualifiedName '<>--')? )

	secondCardinality=Cardinality? 
	('{'
		descriptions+=RelationDescription
		(',' descriptions+=RelationDescription)*
	'}')?

	( '(' secondEndName=ID ')')?
	('{' secondEndMetaAttributes+=RelationMetaAttribute (',' secondEndMetaAttributes+=RelationMetaAttribute )*
	'}')?

	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementReference:QualifiedName])?
 ;

ExternalRelation:
	('@'relationType=RelationStereotype)?
	'relation'
	('(' firstEndName=ID ')')?
		('{' firstEndMetaAttributes+=RelationMetaAttribute (',' firstEndMetaAttributes+=RelationMetaAttribute )*
	'}')?
    firstEnd=[ClassElement:QualifiedName]
	firstCardinality=Cardinality?
	(isAssociation?='--' (name=QualifiedName '--')? 
	| 
	isComposition?='<>--' (name=QualifiedName '<>--')? )
	    secondCardinality=Cardinality? 
	('{'
		descriptions+=RelationDescription
		(',' descriptions+=RelationDescription)*
	'}')?
	('(' secondEndName=ID ')')?
		('{' secondEndMetaAttributes+=RelationMetaAttribute (',' secondEndMetaAttributes+=RelationMetaAttribute )*
	'}')?
	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementReference:QualifiedName])?
;

RelationDescription:
	name=ID	
;

Attribute:
	name=ID ':' (attributeType=[DataType] | attributeType=BasicDataTypes)
;

RelationMetaAttribute returns string:
	'readOnly' | 'const' | 'union'
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
;

BasicDataTypes returns string:
	'number' | 'string' | 'Date'
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