grammar Tonto
hidden(WS, SL_COMMENT, ML_COMMENT)

Model:
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
	'class' name=ID ('specializes' specializationClass=[Class|QualifiedName])?  '{'
        references=EndurantReference*
	'}'
;

Endurant:
    type=EndurantType name=ID ('specializes' specializationEndurant=[Endurant|QualifiedName])? ('{' 

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

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
