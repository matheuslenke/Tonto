grammar Tonto

entry Model:
	imports+=Import*
	modules+=ContextModule*
;

// <--- Criação de Módulos --->
/*
* ContextModule is the main declaration of a module, that wraps a context of elements. All declarations should
* go inside this declaration
*/
ContextModule:
	'module' name=QualifiedName '{'
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

fragment ClassElementInfo:
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
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode'
;

BaseSortalStereotype returns string:
	'subkind' | 'phase' | 'role' | 'historicalRole' | 'relator'
;

ElementOntologicalNature:
	'of' natures+=OntologicalNature (',' natures+=OntologicalNature)*
;

OntologicalNature returns string:
	'objects' | 'relators' | 'modes' |
	'collectives' | 'functional-complex' |
	'quantity' | 'intrinsic-modes' | 'extrinsic-modes' |
	'quality' | 'type' | 'abstract' | 'event'
;

ElementReference: 
	EndurantInternalReference | EndurantExternalReference
;

EndurantInternalReference:
	('@'relationType=RelationStereotype)?
	('(' firstEndName=QualifiedName ')')?
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
	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementReference:QualifiedName])?
 ;

EndurantExternalReference:
	('@'relationType=RelationStereotype)?
	'ref'
	('(' firstEndName=QualifiedName ')')?
	firstCardinality=Cardinality?
    firstEnd=[ClassElement:QualifiedName]
	(isAssociation?='--' (name=QualifiedName '--')? 
	| 
	isComposition?='<>--' (name=QualifiedName '<>--')? )
	    secondCardinality=Cardinality? 
	('{'
		descriptions+=RelationDescription
		(',' descriptions+=RelationDescription)*
	'}')?
	( '(' secondEndName=ID ')')?
	secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementReference:QualifiedName])?
;

RelationDescription:
	name=ID	
;

Attribute:
	name=ID ':' (attributeType=[DataType] | attributeType=BasicDataTypes)
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
	'relator'
;

// Relator:
//     'relator' name=QualifiedName ('{' 
//         references=EndurantInternalReference*
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