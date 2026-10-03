import { bionicSegments } from "../core/bionic";

export default function BionicText({ text, bionic }) {
  return (
    <p className="whitespace-pre-wrap">
      {bionicSegments(text).map((seg, i) =>
        seg.type === "word" ? (
          <span key={i} data-word>
            {bionic ? (
              <>
                <b>{seg.bold}</b>
                {seg.rest}
              </>
            ) : (
              seg.bold + seg.rest
            )}
          </span>
        ) : (
          seg.text
        )
      )}
    </p>
  );
}