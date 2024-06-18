grammar Tonto

import "./grammar/terminals"
import "./grammar/ontological-category"
import "./grammar/ontological-natures"
import "./grammar/class-declaration"
import "./grammar/relations"
import "./grammar/attributes"
import "./grammar/datatypes"
import "./grammar/gensets"
import "./grammar/diagram"
import "./grammar/package-declaration"

/**
 * Model is the entry point of the grammar.
 * It contains a list of imports, which can be a PackageDeclaration
 * It then contains the declaration of a Package, or a Diagram.
 * The Package Declaration is supposed to have all entities, while the Diagram
 * represents the view of the model.
 */
entry Model:
	imports+=Import*
	(module=PackageDeclaration | diagram=TontoDiagramView)
;

Import:
	'import' referencedModel=[PackageDeclaration:QualifiedName]
;