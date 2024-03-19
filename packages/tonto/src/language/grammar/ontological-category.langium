OntologicalCategory:
	ontologicalCategory=(UnspecifiedType | NonEndurantType | EndurantType)
;

UnspecifiedType returns string:
	'class'
;

NonEndurantType returns string:
	'event' | 'situation' | 'process'
;

EndurantType returns string:
	NonSortal | UltimateSortal | Sortal;


NonSortal returns string:
	'category' | 'mixin' | 'phaseMixin' | 'roleMixin' | 'historicalRoleMixin'
;

UltimateSortal returns string:
	'kind' | 'collective' | 'quantity' | 'quality' | 'mode' | 'intrinsicMode' | 'extrinsicMode' | 'relator' | 'type' | 'powertype'
  // do we keep mode here?
;

Sortal returns string:
	'subkind' | 'phase' | 'role' | 'historicalRole'
;