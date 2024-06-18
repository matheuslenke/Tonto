import "ontological-category"
import "terminals"
import "attributes"
import "relations"

// <--- DataTypes --->
DataType:
	ontologicalCategory='datatype' id=QualifiedName ontologicalNature=ElementOntologicalNature? 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(attributes+=Attribute)*
	'}')?
;

// <--- Enums --->
Enum infers DataType:
	isEnum?='enum' id=QualifiedName
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(elements+=EnumElement
		((',') elements+=EnumElement)*)?
	'}')?
;

EnumElement:
	id=ID
;
