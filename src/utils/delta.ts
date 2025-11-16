import katex from "katex";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import sanitize from "sanitize-html";

// The following types mirror a third-party library, Quill Delta.
// Make sure these types are up-to-date with the third-party library.
// See the code: https://github.com/slab/delta/blob/main/src/Op.ts
interface AttributeMap {
  [key: string]: unknown;
}

interface Op {
  // only one property out of {insert, delete, retain} will be present
  insert?: string | Record<string, unknown>;
  delete?: number;
  retain?: number | Record<string, unknown>;

  attributes?: AttributeMap;
}

function deltaToHTMLString(deltaOperations: Op[]): string {
  const deltaConverter = new QuillDeltaToHtmlConverter(deltaOperations);
  deltaConverter.afterRender((_, HTMLString) => {
    // create html doc and grab its body element
    const HTMLDoc = new DOMParser().parseFromString(HTMLString, "text/html");
    const bodyEl = HTMLDoc.getElementsByTagName("body")[0];

    // get all formula and non-formula content
    const latexContainers = bodyEl.querySelectorAll(".ql-formula");
    const nonFormulaEls = bodyEl.querySelectorAll(":not(.ql-formula)");

    for (let i = 0; i < nonFormulaEls.length; i++) {
      const nonFormulaEl = nonFormulaEls[i];
      if (latexContainers.length === 0) {
        nonFormulaEls[i].removeAttribute("style");
        continue;
      }

      for (let j = 0; j < latexContainers.length; j++) {
        const latexContainer = latexContainers[j];
        if (latexContainer.contains(nonFormulaEl)) {
          continue;
        }
        nonFormulaEls[i].removeAttribute("style");
      }
    }

    for (let i = 0; i < latexContainers.length; i++) {
      const latex = latexContainers[i].innerHTML;
      let renderedLatex = "";

      try {
        renderedLatex = katex.renderToString(
          sanitize(latex, { disallowedTagsMode: "recursiveEscape" }),
          { output: "mathml" }
        );
      } catch (error) {
        console.error(
          new Error("Error when render LaTeX to string: ", { cause: error })
        );
      }

      latexContainers[i].insertAdjacentHTML("beforebegin", renderedLatex);
      latexContainers[i].remove();
    }

    return bodyEl.innerHTML;
  });

  const HTMLString = deltaConverter.convert();
  return HTMLString;
}

export { deltaToHTMLString };
