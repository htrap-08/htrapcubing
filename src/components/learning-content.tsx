import { Link } from "@tanstack/react-router";
import type { PuzzleId } from "@/lib/puzzles";
import { puzzleName } from "@/lib/seo";

export function SolverHelp({ puzzle }: { puzzle: PuzzleId }) {
  const name = puzzleName(puzzle);
  return (
    <section className="seo-content" aria-labelledby="solver-help-title">
      <h2 id="solver-help-title">Using the {name} colour solver</h2>
      <p>
        Choose the puzzle before entering colours. Match the physical puzzle’s orientation to the
        editor, complete every sticker and review the full state before requesting a solution.
      </p>
      <div className="seo-help-grid">
        <details>
          <summary>How should I hold and enter my cube?</summary>
          <p>
            For the standard cube editor, hold white on top and green at the front. Read each face
            from outside the cube; do not mirror the back face. Match the editor’s face labels when
            rotating the physical cube. Side puzzles and Square-1 have their own grip and piece
            instructions in the editor.
          </p>
          <p>
            A {name} needs its own puzzle mode. Do not enter a 4×4 into the 3×3 editor or treat a
            Square-1 corner as a single square sticker.
          </p>
        </details>
        <details>
          <summary>Why are my colours rejected?</summary>
          <p>
            A full colour count is necessary but does not prove a state is physically possible.
            Check face orientation, opposite colours and individual pieces. A twisted corner,
            flipped edge or exchanged stickers on an ordinary 3×3 cannot be corrected by legal
            turns. Recheck the input before assuming the puzzle is damaged.
          </p>
        </details>
        <details>
          <summary>How do I scan a cube accurately?</summary>
          <p>
            Use even light without glare, keep the face square to the camera and place the sample
            points inside the stickers. Follow the displayed face order and orientation. Review the
            detected colours after each scan and correct errors before solving. Camera permission
            needs HTTPS or localhost; entering colours manually is available if permission is
            denied.
          </p>
        </details>
        <details>
          <summary>Where do my scans and results go?</summary>
          <p>
            Camera colour classification happens in your browser; camera images are not uploaded. A
            4×4–10×10 automatic solve, when the service is available, sends the size and entered
            colours to the solver service. The 3×3 draft is retained for the current tab so you can
            visit the graph animation and return.{" "}
            <Link to="/privacy">Read the privacy details.</Link>
          </p>
        </details>
      </div>
      <p>
        <Link to="/scrambledeggs/algorithms" search={{ puzzle }}>
          Learn {name} notation and methods →
        </Link>{" "}
        · <Link to="/scrambledeggs/timer">Practise with the speedcubing timer</Link>
      </p>
    </section>
  );
}

const largeNotes: Record<number, [string, string, string]> = {
  4: [
    "Build each centre from two same-colour bars. With no fixed centre, check neighbouring colours against the corners before completing the last two centres. A uniform centre in the wrong position still prevents a correct reduction.",
    "Each edge has just two wings. After joining a pair, put it into a storage position before restoring the working slice. Disturbing a completed pair while restoring centres is a common reason the last edges seem impossible.",
    "Check all twelve pairs before diagnosing parity. In a fully reduced 4×4, a single apparently flipped edge group or an odd reduced swap needs a 4×4-specific correction. The advanced parity examples below link to their grip and source.",
  ],
  5: [
    "The middle sticker of each face anchors the colour scheme. Assemble the 3×3 centre region around it, checking that a bar contains the correct colour all the way across before inserting it.",
    "An edge triple contains a middle edge and a matching wing on each side. Use the middle edge’s two colours to identify the target triple; a same-colour front strip can hide a wrong sticker on the other side.",
    "A partly paired last edge is an edge-pairing problem. Finish all triples and restore centres before moving to the 3×3 stage. Do not apply a 4×4 OLL-parity sequence simply because two wings look reversed.",
  ],
  6: [
    "There is no fixed centre to tell you which face is which. Plan opposite and adjacent colours first, then build the 4×4 centre regions. Inspect the inner and outer rows separately instead of treating the centre as one solid face too early.",
    "Each four-piece edge consists of two distinct wing pairs. Work on one distance from the edge midpoint at a time and compare both sticker colours; a pair from the other orbit cannot replace it.",
    "After joining both wing pairs into one four-piece edge, protect the entire group when restoring slices. A 4×4 wide turn moves a different portion of a 6×6; use a 6×6-specific correction and setup for an actual reduced parity case.",
  ],
  7: [
    "Use the fixed middle stickers to orient all six faces. The 5×5 centre region is easier to inspect as concentric work areas: preserve the central structure while adding the outer bars.",
    "Every edge has a middle edge and two wing pairs at different distances from it. Match each orbit to the same two-colour target, then confirm the five pieces form one consistent edge group.",
    "If an edge looks solved from the front but not from above, inspect the other sticker on every wing. Do not start last-layer algorithms until the centres and all five-piece edges are restored; outer turns preserve those completed groups.",
  ],
  8: [
    "The 6×6 centre regions have no fixed anchor. Record the colour scheme from the corners and build consistent bars, checking both ends of each bar. Recheck adjacency before closing the last two centres.",
    "There are three wing pairs per six-piece edge. Keep a separate checkpoint for the inner, middle and outer orbit rather than repeatedly mixing all six stickers while pairing.",
    "Wide-turn width is part of the algorithm, not an optional convenience. Confirm exactly which layers move and where the target orbit sits before using an 8×8 parity or pairing sequence. Return every working slice before the outer-layer finish.",
  ],
  9: [
    "Fixed centre stickers anchor the large 7×7 centre regions. Build around those anchors and inspect the outermost centre rows independently; one wrong piece is easy to miss in an otherwise uniform block.",
    "Each seven-piece edge combines one middle edge with three wing pairs. Use that middle edge as the two-colour reference, then check each pair’s distance from the midpoint before joining the complete group.",
    "Before reduction, count seven matching pieces on both visible sides of every edge, not just the face pointing toward you. An unfinished wing orbit needs pairing work rather than a generic last-layer algorithm.",
  ],
  10: [
    "Plan the colour scheme before building the 8×8 centre regions. Work in small, inspectable bars and preserve completed regions as you extend them. There are 64 centre stickers per face to check, so verify each row instead of relying on the overall colour impression.",
    "Each eight-piece edge contains four distinct wing pairs. Track the completed orbits separately, then verify both colours of all eight pieces before storing the edge group.",
    "Large wide turns can disturb several previously completed orbits at once. Identify the exact slice range before each correction, restore the working layers and recheck all twelve edges. Only then use the shared 3×3 finishing instructions.",
  ],
};
export function TutorialNotes({ puzzle }: { puzzle: PuzzleId }) {
  const n = Number(puzzle.split("x")[0]);
  if (n >= 4 && n <= 10)
    return (
      <section className="seo-content">
        <h2>{puzzleName(puzzle)} reduction checkpoints</h2>
        <dl className="seo-facts">
          <div>
            <dt>Centre region per face</dt>
            <dd>
              {n - 2}×{n - 2} ({(n - 2) ** 2} stickers)
            </dd>
          </div>
          <div>
            <dt>Pieces in each edge group</dt>
            <dd>{n - 2}</dd>
          </div>
          <div>
            <dt>Wing pairs per edge</dt>
            <dd>
              {Math.floor((n - 2) / 2)}
              {n % 2 ? " plus one middle edge" : ""}
            </dd>
          </div>
        </dl>
        {largeNotes[n]!.map((text, i) => (
          <div key={text}>
            <h3>
              {["Centres and colour scheme", "Edge orbits and pairing", "Before the 3×3 finish"][i]}
            </h3>
            <p>{text}</p>
          </div>
        ))}
        <p>
          The shared finishing sequences live in the{" "}
          <Link to="/scrambledeggs/algorithms" search={{ puzzle: "3x3" }}>
            3×3 guide
          </Link>
          . Use a size-specific source for inner-slice corrections rather than copying a 4×4
          sequence to a wider puzzle.
        </p>
      </section>
    );
  if (puzzle === "3x3")
    return (
      <section className="seo-content">
        <h2>Recognise the case before learning the moves</h2>
        <h3>First layer: a face is not a layer</h3>
        <p>
          Make the cross with each side sticker matching its centre. Then place each corner between
          the three centres matching its colours. Four white corners together are only a solved
          layer when the side colours agree too.
        </p>
        <h3>Middle layer: choose an edge without the last-layer colour</h3>
        <p>
          Hold the finished layer below. Find a top-layer edge without yellow, align its front
          sticker with the matching centre and decide whether its other sticker belongs to the left
          or right. Use the corresponding insertion. If the piece is already in a middle slot
          incorrectly, remove it with an insertion, realign it on top and reinsert.
        </p>
        <h3>Last layer: orientation and position are different</h3>
        <p>
          A yellow sticker pointing up is an orientation result; matching the surrounding side
          colours is a position result. Match the dot, L or line grip in the source before an
          edge-orientation sequence. For corner-twisting with R′ D′ R D, keep the working corner at
          top-front-right and complete each four-move repetition. Bring the next corner into that
          slot with U only; changing the whole grip mid-process can undo the lower layers.
        </p>
        <h3>Worked sequence: R U R′ U′</h3>
        <p>
          Read it as right clockwise, top clockwise, right counterclockwise, top counterclockwise.
          Clockwise is judged while looking directly at the turned face. Open its 3D example to see
          a constructed starting state and the result. That example illustrates the sequence; it is
          not a complete catalogue of every corner-insertion case.
        </p>
        <p>
          <Link to="/scrambledeggs/solver" search={{ puzzle: "3x3" }}>
            Check a physical cube with the colour solver →
          </Link>{" "}
          · <Link to="/scrambledeggs/cool-stuff">See what each move does to the stickers</Link>
        </p>
      </section>
    );
  return null;
}

export function TimerHelp() {
  return (
    <section className="seo-content">
      <h2>How to use the speedcubing timer</h2>
      <p>
        Choose the puzzle, apply its scramble and get ready. On a keyboard, hold space until the
        timer is armed, then release to start; press space to stop. On a phone, use Start and Stop.
        Finish a solve before changing the puzzle or generating another scramble.
      </p>
      <h3>What do Ao5 and Ao12 mean here?</h3>
      <p>
        Ao5 uses your latest five solves: discard the fastest and slowest, then average the other
        three. For Ao12, discard the fastest and slowest of the latest twelve and average the
        remaining ten. One DNF is discarded as the slowest; two DNFs make the average unavailable.
        The displayed best time excludes DNFs.
      </p>
      <h3>Where is my session saved?</h3>
      <p>
        Up to 200 results are saved in this browser’s local storage. There is no account sync:
        another device or browser has a separate session, and clearing site data removes this
        history. These are personal practice results, not certified competition records.
      </p>
      <p>
        <Link to="/scrambledeggs/algorithms" search={{ puzzle: "3x3" }}>
          Learn the 3×3 method before timing it
        </Link>{" "}
        · <Link to="/privacy">Storage and privacy</Link>
      </p>
    </section>
  );
}

export function GraphExplanation() {
  return (
    <section className="seo-content">
      <h2>What the cube sticker graph shows</h2>
      <p>
        The model and graph show the same 3×3 state. Each dot marks a sticker position, and the
        colour tells you which sticker occupies it. A face turn permutes those positions. Follow one
        coloured dot through a move, then look for the same sticker on the cube.
      </p>
      <h3>A move is a permutation</h3>
      <p>
        A clockwise quarter turn cycles the stickers around a face and moves neighbouring strips.
        Its inverse reverses those cycles. Four identical quarter turns return every position to its
        starting state. The animation applies the solution’s moves to both views, so you can compare
        the changing arrangements step by step.
      </p>
      <h3>This is not a search tree</h3>
      <p>
        The rings are a layout for sticker positions. They do not represent every reachable cube
        state, branches explored by the solver, or the difficulty of a solve. A useful check is R
        followed by R′: the two permutations cancel even though the graph may look complicated
        halfway through.
      </p>
      <h3>Bring your own cube</h3>
      <p>
        Enter all six faces in the{" "}
        <Link to="/scrambledeggs/solver" search={{ puzzle: "3x3" }}>
          3×3 colour solver
        </Link>
        , then choose Cool animation. Your tab retains the draft when you return. New random cube
        creates a fresh example on this page. Learn{" "}
        <Link to="/scrambledeggs/algorithms">move notation</Link> to follow the displayed turns.
      </p>
      <p>
        This independently coded visual experiment was inspired by{" "}
        <a href="https://sael.net/cube-graph/" target="_blank" rel="noreferrer">
          Ryan Sael’s Cube Graph
        </a>
        . See <Link to="/legal">project attribution and software licences</Link>.
      </p>
    </section>
  );
}
