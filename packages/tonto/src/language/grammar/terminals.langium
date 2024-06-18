hidden terminal WS: /\s+/;
terminal INT returns number: /[0-9]+/;
terminal NUMBER returns number: /(-)?[0-9]+(\.[0-9]*)?/;
terminal STRING: /"[^"]*"|'[^']*'/;

// IDs
terminal QUOTED_ID returns string: /\"(\\.|\\\\|[^"\\])*\"/;
terminal ID: /[_a-zA-Z][\w_]*/;
// terminal fragment CAMEL_CASE_ID: /[a-z]([a-zA-Z0-9_]*)/;
// terminal fragment CAPITALIZED_ID: /[A-Z]([a-zA-Z0-9_]*)/;-

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

QualifiedName returns string:
	ID ('.' ID)*
;