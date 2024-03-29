import * as React from "react";
import * as dalliance from "dalliance";

import { GeneData } from "./GeneViewer";

interface State {
  genome: string;
  genes: string;
  browser: typeof dalliance.Browser | undefined;
}

interface Props {
  gene: typeof GeneData;
  guides: Array<any>;
  hoveredGuide: number | undefined;
  onGuideHovered: (hoveredGuide: number) => void;
  onPdbClicked: (pdb: string) => void;
}

let viewport: HTMLDivElement | undefined = undefined;

export default class SequenceViewer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      genes: "http://www.derkholm.net:8080/das/hsa_54_36p/",
      genome: "http://www.derkholm.net:8080/das/hg18comp/",
      browser: undefined
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { hoveredGuide, guides, gene } = this.props;
    const { browser } = this.state;
    if (prevProps.hoveredGuide !== hoveredGuide) {
      if (!browser) {
        console.log("Error: browser must not be undefined"); // TODO make this throw instead of log
        return;
      }
      browser.clearHighlights();
      if (hoveredGuide) {
        const guide = guides[hoveredGuide];
        let exonStart = gene.exons.find((exon: any) => exon.exon_id === guide.exon_id).start
        browser.highlightRegion(gene.chromosome, 1 + guide.start + exonStart, 1 + guide.start + exonStart + 23);
      }
    }
  }
  // TODO we can use trix to speed up the browser

  componentDidMount() {
    const { gene, onPdbClicked, onGuideHovered } = this.props;

    let geneStart = Math.min(...gene.exons.map((exon: any) => exon.start));
    let geneEnd = Math.max(...gene.exons.map((exon: any) => exon.end));
    let chr = gene.chromosome;
    let browser = new dalliance.Browser({
      chr: chr,
      viewStart: geneStart,
      viewEnd: geneEnd,
      defaultSubtierMax: 3,

      coordSystem: {
        speciesName: "Human",
        taxon: 9606,
        auth: "GRCh",
        version: "37",
        ucscName: "hg19"
      },

      sources: [
        {
          name: "Genome",
          twoBitURI: "//www.biodalliance.org/datasets/hg19.2bit",
          tier_type: "sequence"
        },
        {
          name: "Guides",
          desc: "sgRNAs in the exome",
          bwgURI: "/guides.bb",
          style: [
            {
              type: "default",
              style: {
                glyph: "ANCHORED_ARROW",
                LABEL: false,
                HEIGHT: "12",
                BGITEM: true,
                BUMP: true,
                STROKECOLOR: "black",
                FGCOLOR: "black",
                BGCOLOR: "blue"
              }
            }
          ],
          collapseSuperGroups: true
        },
        {
          name: "PDBs",
          desc: "PDBs mapped to gene coordinates",
          bwgURI: "/pdbs.bb",
          style: [
            {
              type: "default",
              style: {
                glyph: "ANCHORED_ARROW",
                LABEL: true,
                HEIGHT: "12",
                BGITEM: true,
                STROKECOLOR: "black",
                BUMP: true,
                FGCOLOR: "black"
              }
            }
          ],
          collapseSuperGroups: true
        },
        {
          name: "Genes",
          // style: [
          //   {
          //     type: "default",
          //     style: {
          //       glyph: "ARROW",
          //       LABEL: true,
          //       HEIGHT: "12",
          //       BGITEM: true,
          //       STROKECOLOR: "black",
          //       FGCOLOR: "black"
          //     }
          //   }
          // ],
          desc: "Gene structures from GENCODE 19",
          bwgURI: "/exome.bb",
          stylesheet_uri: "/gencode.xml",
          collapseSuperGroups: true
        }
      ]
    });
    browser.addFeatureHoverListener((event: any, feature: any, hit: any, tier: any) => {
      if (tier.dasSource.name === "Guides") {
        const index = (hit[0].id.split(':')[0])-1;
        onGuideHovered(index);
      }
    });
    browser.addFeatureListener((event: any, feature: any, hit: any, tier: any) => {
      if (tier.dasSource.name === "PDBs") {
        onPdbClicked(hit[0].id);
      }
    });
    browser.addInitListener(() => browser.setLocation(chr, geneStart, geneEnd));
    this.setState({ browser });
  }

  render() {
    return (
      <div id="svgHolder" ref={(ref: HTMLDivElement) => (viewport = ref)} />
    );
  }
}
