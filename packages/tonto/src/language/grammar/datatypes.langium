import "ontological-category"
import "terminals"
import "attributes"
import "relations"

// <--- DataTypes --->
DataType:
	'datatype' name=ID ontologicalNature=ElementOntologicalNature? 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	('{'
		(attributes+=Attribute)*
	'}')?
;

// <--- Enums --->
Enum infers DataType:
	isEnum?='enum' name=ID 
	('specializes' specializationEndurants+=[DataTypeOrClass:QualifiedName]
	(',' specializationEndurants+=[DataTypeOrClass:QualifiedName])?
	)? 
	'{'
		(elements+=EnumElement
		((',') elements+=EnumElement)*)?
	'}'
;

EnumElement:
	name=ID
;
