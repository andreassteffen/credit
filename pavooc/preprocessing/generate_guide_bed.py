from pavooc.db import guide_collection
from pavooc.config import GUIDE_BED_FILE


def guide_to_bed(gene, guide, index):
    """
    Serialize one guide into bed format
    :gene: The gene where the guide is contained in
    :guide: guide information
    :index: the index of the guide
    :returns: A string containing one line with the bed-data of the provided
    guide
    """
    strand = '+' if guide['orientation'] == 'FWD' else '-'

    exon_start = [exon['start'] for exon in gene['exons']
                  if exon['exon_id'] == guide['exon_id']][0]

    # BED is 0-based
    return '\t'.join([str(v) for v in [
        gene['chromosome'],
        guide['start'] + exon_start,
        guide['start'] + exon_start + 23,
        '{}:{}'.format(index+1, guide['target']),
        min(100,  max(int(guide['score'] * 100), 0)),
        strand,
        guide['start'] + exon_start,
        guide['start'] + exon_start + 23,
        ','.join([str(v) for v in [0, 255, 0]]),
        '1',
        '23',
        '0'
    ]])


def main():
    with open(GUIDE_BED_FILE, 'w') as f:
        for gene_guides in guide_collection.find():
            for guide_index, guide in enumerate(gene_guides['guides']):
                f.write(guide_to_bed(gene_guides, guide, guide_index))
                f.write('\n')


if __name__ == "__main__":
    main()
