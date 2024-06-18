import "terminals"
import "class-declaration"
import "gensets"

/**
 * PackageDeclaration is the main declaration of a module, that wraps a context of elements. All declarations should
 * go inside this declaration
 */
PackageDeclaration:
	(isGlobal?='global')? 'package' (id=QualifiedName)

	declarations+=Declaration*
;

// <--- Declarations --->

Declaration:
	ClassDeclaration | AuxiliaryDeclaration
;

AuxiliaryDeclaration:
	DataType | Enum | GeneralizationSetImpl | GeneralizationSetShort | ExternalRelation
;