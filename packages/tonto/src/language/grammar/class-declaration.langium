import "ontological-category"
import "ontological-natures"
import "datatypes"
import "relations"

interface ClassDeclaration {
	classElementType: OntologicalCategory;
	name: string;
	ontologicalNatures?: ElementOntologicalNature;
	instanceOf?: @ClassDeclaration;
	specializationEndurants: @ClassDeclaration[];
	attributes: Attribute[];
	references: ElementRelation[];
}

ClassDeclarationRule returns ClassDeclaration:
	classElementType=OntologicalCategory 
	name=QualifiedName
	ontologicalNatures=ElementOntologicalNature?
    ('(' 'instanceOf' instanceOf=[ClassDeclaration:QualifiedName] ')')?
    ('specializes' specializationEndurants+=[ClassDeclaration:QualifiedName]
		(',' specializationEndurants+=[ClassDeclaration:QualifiedName])?
		)? 
		('{'
			(attributes+=Attribute | references+=InternalRelation)*
    '}')?
;

type DataTypeOrClass = DataType | ClassDeclaration;
type DataTypeOrClassOrRelation = DataType | ClassDeclaration | ElementRelation;