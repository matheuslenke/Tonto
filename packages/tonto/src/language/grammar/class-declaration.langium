import "ontological-category"
import "ontological-natures"
import "datatypes"
import "relations"

ClassDeclaration:
	classElementType=OntologicalCategory
	(name=ID)
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassDeclaration:QualifiedName] ')')?
    ('specializes' specializationEndurants+=[ClassDeclaration:QualifiedName]
		(',' specializationEndurants+=[ClassDeclaration:QualifiedName])*
    )?
		('{'
      label=Label?
      description=Description?
			(attributes+=Attribute | references+=InternalRelation)*
    '}')?
;

type DataTypeOrClass = DataType | ClassDeclaration;