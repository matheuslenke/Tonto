import "terminals"
import "datatypes"

Attribute:
	name=QualifiedName ':' attributeTypeRef=[DataType:QualifiedName]
	cardinality=Cardinality?
	('{'((isOrdered?='ordered') & (isConst?='const') & (isDerived?='derived'))? '}')?
;

Cardinality:
	'[' lowerBound=(INT | '*')
	('..' upperBound=(INT | '*'))? ']'
;