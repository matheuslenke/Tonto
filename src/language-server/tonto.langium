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
	Class | Endurant | Relator | DataType | EnumData | GeneralizationSet
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
	// 'relator' |
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


Class:
	prefix=ClassPrefix? 'class' name=QualifiedName ('specializes' specializationClasses+=[Class:QualifiedName] 
	(',' specializationClasses+=[Class:QualifiedName])? )?
	('{'
        references=EndurantReference*
	'}')?
;

Endurant:
    type=EndurantType name=QualifiedName ('specializes' specializationEndurants+=[Element:QualifiedName]
	(',' specializationEndurants+=[Element:QualifiedName])? 
	)? ('{' 
		references=EndurantReference*
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
	'subkind' | 'phase' | 'role' | 'historicalrole'
;

EndurantReference:
    ('@'relationType=RelationStereotype)? 'ref'? (name=ID)? firstCardinality=Cardinality?  ':' secondCardinality=Cardinality?  referencedElement=[Element:QualifiedName]
	('{'
		descriptions+=RelationDescription
		(',' descriptions+=RelationDescription)*
	'}')?
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
	'aggregation'
;

Relator:
    'relator' name=QualifiedName '{' 
        references=EndurantReference*
    '}'
;

Cardinality:
	'[' lowerBound=(INT | '*') 
	('..' upperBound=(INT | '*'))? ']'
;

// <--- Generalization Set --->

GeneralizationSet:
	(disjoint='disjoint')? (complete='complete')?
	'genset' name=ID '{' 
		'general' generalItem+=[Endurant:QualifiedName] (',' generalItem+=[Endurant:QualifiedName])*
		('categorizer' categorizerItems+=[Endurant:QualifiedName] (categorizerItems+=[Endurant:QualifiedName])*)?
		'specifics' specificItems+=[Endurant:QualifiedName] (',' specificItems+=[Endurant:QualifiedName])*
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
