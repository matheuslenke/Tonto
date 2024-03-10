import "terminals"
import "class-declaration"

ElementRelation:
	InternalRelation | ExternalRelation
;

InternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?
	RelationData
;

ExternalRelation infers ElementRelation:
	('@'relationType=RelationStereotype)?
	'relation' firstEnd=[ClassDeclaration:QualifiedName]
	RelationData
;

fragment RelationData:
	firstEndMetaAttributes=RelationMetaAttributes?
	firstCardinality=Cardinality?
	RelationName
	secondCardinality=Cardinality?
	secondEnd=[DataTypeOrClass:QualifiedName]
	
	secondEndMetaAttributes=RelationMetaAttributes?
	('specializes' specializeRelation=[ElementRelation:QualifiedName])?
	(hasInverse='inverseOf' inverseEnd=[ElementRelation:QualifiedName])?
;

fragment RelationName:
	(RelationConnectors ((name=QualifiedName | name=STRING) '--')?) 
	// |
	// (('--' name=QualifiedName)? InvertedRelationConnectors)
;

fragment RelationConnectors:
	(isAssociation?='--' | isAggregation?='<>--' | isComposition?='<o>--')
;
// fragment InvertedRelationConnectors:
// 	(isAssociation?='--' | isAggregationInverted?='--<>' | isCompositionInverted?='--<o>')
// ;

RelationMetaAttributes:
	'('
	('{' endMetaAttributes+=RelationMetaAttribute
	(',' endMetaAttributes+=RelationMetaAttribute )* '}')?
	(endName=ID)?
	')'
;

RelationMetaAttribute:
	isOrdered?='ordered' | isConst?='const' | isDerived?='derived' |
	('subsets' subsetRelation=[ElementRelation:QualifiedName] ) |
	('redefines' redefinesRelation=[ElementRelation:QualifiedName] )
;

RelationStereotype returns string:
	'material' |
	'derivation' |
	'comparative' |
	'mediation' |
	'characterization' |
	'externalDependence' |
	'componentOf' |
	'memberOf' |
	'subCollectionOf' |
	'subQuantityOf' |
	'instantiation' |
	'termination' |
	'participational' |
	'participation' |
	'historicalDependence' |
	'creation' |
	'manifestation' |
	'bringsAbout' |
	'triggers' |
	'composition' |
	'aggregation' |
	'inherence' |
	'value' |
	'formal' |
	'manifestation' |
	'constitution' |
	ID |
	STRING
;