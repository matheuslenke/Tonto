grammar Tonto

entry Model:
	elements+=ContextModule*
;

// <--- Criação de Módulos --->
	
ContextModule:
	'module' name=QualifiedName '{'
		elements+=Element*
	'}'
;

QualifiedName returns string:
	ID ('.' ID)*
;

// <--- Elementos e classes --->

Element:
	ClassElement | AuxiliaryDeclarations
;

ClassElement:
    Class | Endurant
;

AuxiliaryDeclarations:
	DataType | EnumData | GeneralizationSet | EndurantExternalReference
;

Stereotype:
	'@' stereotype=(
	'type' |
	'historicalRole' |
	'historicalRoleMixin' |
	'event' |
	'situation' |
	'category' |
	'mixin' |
	'roleMixin' |
	'phaseMixin' |
	'kind' |
	'collective' |
	'quantity' |
	'relator' |
	'quality' |
	'mode' |
	'subkind' |
	'role' |
	'phase' |
	'enumeration' |
	// 'datatype' |
	'abstract'
	)
;

ClassPrefix:
	stereotype=Stereotype?
;

Class infers ClassElement:
	prefix=ClassPrefix? 'class' name=QualifiedName ('specializes' specializationClasses+=[ClassElement:QualifiedName] 
	(',' specializationClasses+=[ClassElement:QualifiedName])? )?
    ('instanceOf' instanceOf=[ClassElement:QualifiedName])?
	('{'
         references=EndurantInternalReference*
	'}')?
;

Endurant infers ClassElement:
    type=EndurantType name=QualifiedName ('specializes' specializationEndurants+=[ClassElement:QualifiedName]
	(',' specializationEndurants+=[ClassElement:QualifiedName])? 
    ('instanceOf' instanceOf=[ClassElement:QualifiedName])?
	)? ('{' 
		 references=EndurantInternalReference*
    '}')?
;

EndurantType:
    stereotype=(NonSortalStereotype | UltimateSortalStereotypes | BaseSortalStereotype)
;

NonSortalStereotype returns string:
	'category' | 'mixin' | 'phasemixin' | 'rolemixin' | 'historicalrolemixin' | 'event'
;

UltimateSortalStereotypes returns string:
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode'
;

BaseSortalStereotype returns string:
	'subkind' | 'phase' | 'role' | 'historicalrole' | 'relator'
;

ElementReference:
    EndurantExternalReference | EndurantInternalReference
;

EndurantInternalReference infers ElementReference:
    ('@'relationType=RelationStereotype)?
    firstCardinality=Cardinality?
    (isAssociation?='--' | isComposition?='<>--')
    (name=QualifiedName '--')? secondCardinality=Cardinality?  referencedElement=[Element:QualifiedName]
    ('inverseOf' inverseEnd=([ElementReference:QualifiedName]))?
	('{'
		descriptions+=RelationDescription
		(',' descriptions+=RelationDescription)*
	'}')?
 ;

EndurantExternalReference infers ElementReference:
    firstEnd=[ClassElement:QualifiedName] 
    (isAssociation?='--' | isComposition?='<>--')
    ReferenceInfo
;

fragment ReferenceInfo:
    (name=QualifiedName '--')?
    cardinality=Cardinality? secondEnd=[ClassElement:QualifiedName]
    (hasInverse='inverseOf' inverseEnd=[ElementReference:QualifiedName])?
;

RelationDescription:
	name=ID	
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
		(properties=DataTypeProperty)?
	'}')?
;

DataTypeProperty:
	name=ID ':' type=[DataType]
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