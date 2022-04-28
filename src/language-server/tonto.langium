grammar Tonto

entry Model:
	elements+=ModelElement*
;

ModelElement:
	module=ContextModule 
;

// <--- Criação de Pacotes --->
	
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
	(prefix=ClassPrefix? Class) | Endurant | Relator
;

Stereotype:
	'@'stereotype=ID
;

ClassPrefix:
	stereotype=Stereotype?
;

Class:
	'class' name=ID ('specializes' specializationClass=[Class:ID])?  '{'
        references=EndurantReference*
	'}'
;

Endurant:
    type=EndurantType name=ID ('specializes' specializationEndurant=[Endurant:ID])? ('{' 

    '}')?
;

EndurantType returns string:
    'kind' | 'subkind' | 'collective' | 'phase' | 'role' | 'category' | 'roleMixin' | 'mode' | 'quality'
;

EndurantReference:
    'ref'? refName=ID ':' referencedClass=[Class]
;

Relator:
    'relator' name=ID '{' 
        references=EndurantReference*
    '}'
;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
