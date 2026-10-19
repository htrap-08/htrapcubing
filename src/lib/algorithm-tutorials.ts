import type { PuzzleId } from "./puzzles";
import type { Algorithm } from "./algorithms";
export type Lesson = { title: string; goal: string; check: string };
export type Tutorial = {
  intro: string;
  notation: string;
  lessons: Lesson[];
  source: string;
  sourceLabel: string;
};
const three: Lesson[] = [
  {
    title: "Build a cross",
    goal: "Join four first-colour edges around their centre, matching each side colour too.",
    check: "A cross alone is not enough: the four side stickers must match their centres.",
  },
  {
    title: "Finish the first layer",
    goal: "Keep the cross below. Put a matching corner above its slot and insert it.",
    check: "The whole bottom layer, including its side colours, should match.",
  },
  {
    title: "Fill the middle layer",
    goal: "Find top edges without the last-layer colour. Align an edge with its centre before choosing a left or right insertion.",
    check: "The lower two layers should be complete.",
  },
  {
    title: "Orient the last layer",
    goal: "Make the top cross, then orient the corners using the matching case.",
    check: "A single top colour does not mean the side pieces are positioned correctly.",
  },
  {
    title: "Position the last pieces",
    goal: "Match the corner and edge permutation case, apply its algorithm, then align the top.",
    check: "All six faces should be uniform.",
  },
];
export function tutorialFor(id: PuzzleId): Tutorial {
  if (id === "3x3")
    return {
      intro:
        "Learn one stage at a time. An algorithm only works when its starting case and grip match.",
      notation:
        "U/R/F/D/L/B name faces. An apostrophe reverses a quarter turn; 2 means a half turn. Keep the same front throughout an algorithm unless it includes a rotation.",
      lessons: three,
      source: "https://www.jperm.net/3x3",
      sourceLabel: "J Perm’s beginner tutorial and example solve",
    };
  if (id === "2x2")
    return {
      intro:
        "This puzzle has corners only. Match the side colours rather than solving a single-colour face in isolation.",
      notation:
        "Use outer face turns just as on a 3×3. There are no fixed centres: use neighbouring corner colours to establish the colour scheme.",
      lessons: [
        {
          title: "Solve one layer",
          goal: "Build a complete bottom layer with matching side pairs.",
          check: "Four stickers of one colour together do not necessarily make a solved layer.",
        },
        {
          title: "Orient the remaining corners",
          goal: "Identify the top-corner orientation case and follow a matching tutorial algorithm.",
          check: "Keep the solved layer below and check the top sticker pattern.",
        },
        {
          title: "Permute the corners",
          goal: "Place the top corners in their correct positions, then align the top layer.",
          check: "Both layers’ side colours should match all the way around.",
        },
      ],
      source: "https://jperm.net/2x2",
      sourceLabel: "J Perm’s 2×2 tutorial",
    };
  if (/^\d+x\d+$/.test(id)) {
    const n = Number(id.split("x")[0]);
    return {
      intro: `Solve the ${n}×${n} by reduction: construct centres and edge groups, then use the 3×3 method. Wider puzzles need size-specific slice choices.`,
      notation:
        "Rw turns the outer right face and its adjacent layer together. 3Rw turns three layers. A numbered inner slice is different from a wide turn; follow your guide’s convention.",
      lessons: [
        {
          title: "Establish the colour scheme",
          goal:
            n % 2
              ? "Use the fixed middle stickers to locate each face colour."
              : "Use the corners to establish adjacent and opposite colours before placing centres.",
          check: "Opposite colours and the order around each corner must agree.",
        },
        {
          title: "Build the centres",
          goal: `Join centre pieces into bars, then complete each ${n - 2}×${n - 2} centre while preserving finished work.`,
          check: "Every centre must be complete and in the right position.",
        },
        {
          title: "Pair the edges",
          goal: `Group all ${n - 2} pieces of each edge, working one wing orbit at a time on larger cubes.`,
          check: "Each of the twelve edge groups must have the same two colours.",
        },
        {
          title: "Solve the reduced cube",
          goal: "Treat each centre as one centre and each edge group as one edge. Continue with outer-layer 3×3 turns.",
          check:
            "If a case is impossible on a 3×3, identify the precise parity case before applying a size-specific correction.",
        },
      ],
      source: n === 4 ? "https://www.jperm.net/4x4" : "https://www.cubeskills.com/tutorials",
      sourceLabel:
        n === 4 ? "J Perm’s 4×4 reduction tutorial" : "CubeSkills big-cube tutorial library",
    };
  }
  const side: Record<string, { intro: string; notation: string; lessons: Lesson[] }> = {
    pyraminx: {
      intro: "Solve the tips, align the larger corner/centre groups, then finish the edges.",
      notation:
        "Uppercase turns move a main layer; lowercase turns move a tip only. These are not 3×3 face turns.",
      lessons: [
        {
          title: "Match the tips and centres",
          goal: "Align each tip with its adjoining stickers and arrange the larger pieces around a chosen face.",
          check: "A correct tip does not guarantee its underlying layer is aligned.",
        },
        {
          title: "Solve three first-face edges",
          goal: "Insert matching edges while keeping the completed pieces together.",
          check: "The colours around the first face must match too.",
        },
        {
          title: "Finish the remaining edges",
          goal: "Identify the last three edges’ cycle and orientation, then use the matching case.",
          check: "Choose the direction of the cycle before running an algorithm.",
        },
      ],
    },
    skewb: {
      intro: "A corner-turning puzzle: learn its grip before memorising a sequence.",
      notation:
        "Skewb turns are 120° around corners. Different tutorials label turns differently; use one convention consistently.",
      lessons: [
        {
          title: "Build a complete face",
          goal: "Match one centre and its four surrounding corners.",
          check: "Check the side colours of every corner.",
        },
        {
          title: "Place opposite corners",
          goal: "Follow the beginner method’s grip and corner cases.",
          check: "A cube-style R turn is not a Skewb R turn.",
        },
        {
          title: "Cycle the centres",
          goal: "Identify which centres still need to move and apply the matching cycle.",
          check: "Recheck the solved corners after changing grip.",
        },
      ],
    },
    megaminx: {
      intro:
        "Work around the dodecahedron in layers. Much of the early solve resembles 3×3 edge and corner insertion.",
      notation:
        "A face turn is 72°. R++/D++ in scrambles describe a different convention from ordinary face turns in solving tutorials.",
      lessons: [
        {
          title: "Build a star and first layer",
          goal: "Match five first-colour edges and insert the five corners between them.",
          check: "Each star edge must also match its neighbouring centre.",
        },
        {
          title: "Expand through the middle layers",
          goal: "Insert edges and corners around the puzzle, preserving the completed lower region.",
          check: "Choose the next centre before inserting its surrounding pieces.",
        },
        {
          title: "Finish the last face",
          goal: "Orient and permute its five edges and corners using the matching tutorial cases.",
          check: "A pentagonal last layer has different cycles from a 3×3.",
        },
      ],
    },
    square1: {
      intro: "Shape comes first. Never force a slice when a piece crosses the seam.",
      notation:
        "(a,b) gives top and bottom turns in 30° units. / is a half-turn slice. Negative values reverse the layer turn.",
      lessons: [
        {
          title: "Restore cube shape",
          goal: "Arrange the wide corners and narrow edges so both layers become square.",
          check: "Both slice seams must be clear before every slash.",
        },
        {
          title: "Separate the layer colours",
          goal: "Move top-colour pieces to the top and bottom-colour pieces below.",
          check: "Retain cube shape while using the guide’s case-specific moves.",
        },
        {
          title: "Permute and finish",
          goal: "Position corners and edges, handle odd permutation if present, and align the middle layer.",
          check: "Use the source’s starting orientation for each listed algorithm.",
        },
      ],
    },
  };
  return {
    ...side[id]!,
    source:
      id === "square1"
        ? "https://www.jaapsch.net/puzzles/square1.htm"
        : "https://www.gancube.com/pages/speedcubing-tutorials",
    sourceLabel:
      id === "square1"
        ? "Jaap’s Square-1 notation and cases"
        : "GAN’s puzzle-specific tutorial library",
  };
}
export function algorithmBelongsTo(a: Algorithm, id: PuzzleId): boolean {
  if (id === "3x3") return !a.puzzle && a.group !== "Big cube parity";
  if (id === "2x2")
    return ["b-corner-right", "b-corner-left", "a-oll-sune", "a-oll-antisune", "a-pll-t"].includes(
      a.id,
    );
  if (id === "square1") return a.puzzle === "Square-1";
  if (id === "pyraminx" || id === "megaminx" || id === "skewb")
    return a.puzzle?.toLowerCase() === id;
  // Existing parity sequences are 4×4-specific, not interchangeable on larger cubes.
  // Shared outer-turn finishing algorithms are taught once in the 3×3 guide.
  return id === "4x4" && ["a-parity-oll", "a-parity-pll"].includes(a.id);
}
