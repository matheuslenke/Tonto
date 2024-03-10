// import { AstNode, CstNode, LangiumDocument, Reference } from "langium";
// import { Cardinality, ClassDeclaration, ContextModule, DataTypeOrClass, ElementRelation, RelationMetaAttributes, RelationStereotype } from "../../language/generated/ast.js";

// export interface IRelation extends ElementRelation {
//   toString: () => string
// }

// class Relation implements IRelation {
//   $container: ClassDeclaration | ContextModule;
//   $type: "ElementRelation";
//   firstCardinality?: Cardinality | undefined;
//   firstEnd?: Reference<ClassDeclaration> | undefined;
//   firstEndMetaAttributes?: RelationMetaAttributes | undefined;
//   hasInverse?: "inverseOf" | undefined;
//   inverseEnd?: Reference<ElementRelation> | undefined;
//   isAggregation: boolean;
//   isAssociation: boolean;
//   isComposition: boolean;
//   name?: string | undefined;
//   relationType?: RelationStereotype | undefined;
//   secondCardinality?: Cardinality | undefined;
//   secondEnd: Reference<DataTypeOrClass>;
//   secondEndMetaAttributes?: RelationMetaAttributes | undefined;
//   specializeRelation?: Reference<ElementRelation> | undefined;
//   $containerProperty?: string | undefined;
//   $containerIndex?: number | undefined;
//   $cstNode?: CstNode | undefined;
//   $document?: LangiumDocument<AstNode> | undefined;
  

//   toString: () => string;
// }