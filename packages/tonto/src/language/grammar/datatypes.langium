import "ontological-category"
import "terminals"
import "attributes"
import "relations"

// <--- DataTypes --->
DataType:
	ontologicalCategory='datatype' name=QualifiedName ontologicalNature=ElementOntologicalNature? 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(attributes+=Attribute)*
	'}')?
;

// <--- Enums --->
Enum infers DataType:
	isEnum?='enum' name=QualifiedName
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(elements+=EnumElement
		((',') elements+=EnumElement)*)?
	'}')?
;

EnumElement:
	name=ID
;
