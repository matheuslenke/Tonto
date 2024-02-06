import "class-declaration"

type ClassDeclarationOrRelation = ClassDeclaration | ElementRelation;

// <--- Generalization Set --->
interface GeneralizationSet {
	disjoint: boolean
	complete: boolean
	name: string
	generalItem: @ClassDeclarationOrRelation
	categorizerItems: @ClassDeclarationOrRelation[]
	specificItems: @ClassDeclarationOrRelation[]
}

GeneralizationSetImpl returns GeneralizationSet:
	(disjoint?='disjoint')? (complete?='complete')?
	'genset' name=ID '{'
	// TODO: Change to unordered group when Langium supports it
			(
				'general' generalItem=[ClassDeclarationOrRelation:QualifiedName]
				('categorizer' categorizerItems+=[ClassDeclarationOrRelation:QualifiedName])?
				'specifics' specificItems+=[ClassDeclarationOrRelation:QualifiedName]
				(',' specificItems+=[ClassDeclarationOrRelation:QualifiedName])*
			)
	'}'
;

GeneralizationSetShort returns GeneralizationSet:
	(disjoint?='disjoint')? (complete?='complete')?
	'genset' name=ID 'where' 
	specificItems+=[ClassDeclarationOrRelation:QualifiedName] 	(',' specificItems+=[ClassDeclarationOrRelation:QualifiedName])*
	'specializes' generalItem=[ClassDeclarationOrRelation:QualifiedName]
;
