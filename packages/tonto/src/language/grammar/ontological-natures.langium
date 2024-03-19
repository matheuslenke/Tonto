ElementOntologicalNature:
	'of' natures+=OntologicalNature (',' natures+=OntologicalNature)*
;

OntologicalNature returns string:
	'objects' | 'functional-complexes' | 'collectives'  | 'quantities' |
    'relators' | 'intrinsic-modes' | 'extrinsic-modes' | 'qualities' |
    'events' | 'situations' |  'types' | 'abstract-individuals'
  // Note: 'objects' = 'functional-complexes' or 'collectives' or 'quantities'
;