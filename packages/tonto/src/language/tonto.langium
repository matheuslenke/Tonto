grammar Tonto

import "./grammar/terminals"
import "./grammar/ontological-category"
import "./grammar/ontological-natures"
import "./grammar/class-declaration"
import "./grammar/relations"
import "./grammar/attributes"
import "./grammar/datatypes"
import "./grammar/gensets"

entry Model:
	imports+=Import*
	module=ContextModule
;

/**
 * Package declaration
 */

/**
 * ContextModule is the main declaration of a module, that wraps a context of elements. All declarations should
 * go inside this declaration
 */
ContextModule:
	(isGlobal?='global')? 'package' (name=QualifiedName)

	declarations+=Declaration*
;

Import:
	'import' referencedModel=[ContextModule:QualifiedName] ('as' packageAlias=ID)?
;

// <--- Declarations --->

Declaration:
	ClassDeclaration | AuxiliaryDeclaration
;

AuxiliaryDeclaration:
	DataType | Enum | GeneralizationSetImpl | GeneralizationSetShort | ExternalRelation
;
