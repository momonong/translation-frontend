interface RelationItem {
    source: string;
    target: string;
    weight: number;
  }
  
  interface RelationGroup {
    relation: string;
    items: RelationItem[];
  }
  
  interface Props {
    term: string;
    groups: RelationGroup[];
    onTermClick: (term: string) => void;
  }
  
  export function RelatedTerms({ term, groups, onTermClick }: Props) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">📌 「{term}」的語意關係：</h2>
        {groups.map((group) => (
          <div key={group.relation} className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">🔹 {group.relation}</h3>
            <ul className="list-disc list-inside space-y-1">
              {group.items.map((item, idx) => {
                const nextTerm = item.source === term ? item.target : item.source;
                return (
                  <li key={idx}>
                    <button
                      onClick={() => onTermClick(nextTerm)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1e88e5",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                        fontSize: "1rem"
                      }}
                    >
                      {nextTerm}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  