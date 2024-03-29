#!/usr/bin/env python

import os
import logging
import pickle

from skbio.sequence import DNA
from intervaltree import IntervalTree

from pavooc.config import CHROMOSOMES, GENOME_FILE, CHROMOSOME_FILE, \
    CHROMOSOME_RAW_FILE, EXON_DIR
from pavooc.data import gencode_exons, chromosomes

logging.basicConfig(level=logging.INFO)


try:
    os.mkdir(EXON_DIR)
except OSError:
    pass


def generate_raw_chromosomes():
    # delete newlines from chromosomes
    logging.info('Convert chromosomes into raw form')
    for chromosome_number in CHROMOSOMES:
        chromosome_filename = CHROMOSOME_FILE.format(chromosome_number)
        with open(chromosome_filename) as chromosome_file:
            chromosome = chromosome_file.read()

        raw_chromose_file = CHROMOSOME_RAW_FILE.format(chromosome_number)
        with open(raw_chromose_file, 'w') as chromosome_file:
            chromosome_file.write(
                chromosome[2 + len(chromosome_number):].replace('\n', ''))


def exon_to_fasta(exon_id, exon_data):
    '''
    :returns: a string with two lines, one with a fasta header
    and one with the exon sequence
    '''
    assert len(exon_data['start'].unique()) == 1
    assert len(exon_data['end'].unique()) == 1

    exon = exon_data.iloc[0]

    exon_slice = slice(exon['start'] - 16, exon['end'] + 16)
    exon_seq = chromosomes()[exon['seqname']][exon_slice].upper()

    # TODO why should I revert this
    # if exon.strand == '-':
    #     exon_seq = str(DNA(exon_seq).reverse_complement())

    assert len(exon_seq) == (exon['end'] - exon['start']) + 32

    transcript_ids = ','.join(['{}:{}'.format(v.transcript_id,
                                              v.exon_number)
                               for _, v in exon_data.iterrows()])
    return '>{};{};{};{};{}\n{}\n'.format(
        exon_id,
        exon.strand,
        exon['start'],
        exon['end'],
        transcript_ids,
        exon_seq)


def generate_gene_files():
    '''
    Generate fasta(-like) files containing all exons for a given gene
    '''
    logging.info('Generate gene files containing all exons')
    # for each exon create one file
    for gene_id, exons in gencode_exons().groupby('gene_id'):
        with open(os.path.join(EXON_DIR, gene_id), 'w') as gene_file:
            # TODO double check if it works the other way round: group by
            # start, end and check if if is the same exon_id always...
            for exon_id, exon_group in exons.groupby('exon_id'):
                logging.debug('Write exon {} to gene file {}'
                              .format(exon_id, exon_group.iloc[0]['gene_id']))
                gene_file.write(exon_to_fasta(exon_id, exon_group))
        # TODO i think this is resolved
        # group by start,end, check that exon_id is the same for each group
        # for each group
        # get all transcript_ids and exon_numbers, append them
        # check for duplicates
        # order by exon_id, save ">exonid transcript1:3,transcript2:1"


def combine_genome():
    '''
    Create a file genome.fa which combines all chromosome.fas
    bash:
    # for i in {1..22..1} X Y; do
    # cat chr${i}.fa >> genome.fa
    # done
    '''
    logging.info('Build all-in-one-file genome')
    with open(GENOME_FILE, 'w') as genome_file:
        for chromosome in CHROMOSOMES:
            with open(CHROMOSOME_FILE.format(chromosome)) as chr_file:
                genome_file.write(chr_file.read())


def main():
    generate_raw_chromosomes()
    combine_genome()

    generate_gene_files()


if __name__ == "__main__":
    main()
