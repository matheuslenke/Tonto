import "terminals"
import "datatypes"

Label:
  'label' '{'
    (labels+=LanguageLabelItem)*
  '}'
;

LanguageLabelItem:
  '@' language=ID label=STRING
;

Description:
  'description' '{'
    (descriptions+=LanguageLabelItem)*
'}'
;

Attribute:
	name=QualifiedName ':' attributeTypeRef=[DataType:QualifiedName]
	cardinality=Cardinality?
	('{'((isOrdered?='ordered') & (isConst?='const') & (isDerived?='derived'))? '}')?
;

Cardinality:
	'[' lowerBound=(INT | '*')
	('..' upperBound=(INT | '*'))? ']'
;