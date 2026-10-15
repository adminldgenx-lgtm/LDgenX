#!/usr/bin/env python3
"""Build source-backed migration datasets and a human review inventory."""
import csv
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit,urljoin
from lxml import html as LH
from collect_site import ROOT,dump,norm

LANGUAGE_PAIRS=[
 ('/','/'),('/services','/services'),('/services/adn-environnemental-adne','/services/environmental-dna-edna'),
 ('/services/genomique-des-populations','/services/population-genomics'),
 ('/services/analyse-des-communautes-microbiennes','/services/microbial-community-analysis'),
 ('/services/selection','/services/genomic-selection'),('/services/bioinformatique','/services/bioinformatics'),
 ('/services/sequencage-dpcr','/services/sequencing-dpcr'),('/services/materiel','/services/equipment'),
 ('/services/conservation','/services/conservation'),('/services/tracabilite','/services/traceability'),
 ('/services/selection-genomique','/services/genomic-selection-page'),
 ('/applications','/applications'),('/applications/biodiversite-conservation','/applications/biodiversity-conservation'),
 ('/applications/aquaculture-peche','/applications/aquaculture-fisheries'),
 ('/applications/agriculture-agroecologie','/applications/agriculture-agroecology'),
 ('/applications/environnement-bureaux-d-etudes','/applications/environment-consultancies'),
 ('/a-propos','/about-us'),('/a-propos/equipe','/about-us/team'),('/a-propos/partenaires','/about-us/partners'),
 ('/a-propos/innovation','/about-us/innovation'),('/equipe/dr-maeva-leitwein','/team/dr-maeva-leitwein'),
 ('/equipe/dr-emilie-delpuech','/team/dr-emilie-delpuech'),('/contact','/contact')]

def csv_write(path,rows,fields):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)

def family(p):
    u=urlsplit(p['requested_url']).path
    if u in ['/services/conservation','/services/tracabilite','/services/traceability','/services/selection-genomique','/services/genomic-selection-page']:
        return 'Travaux scientifiques / études détaillées'
    if u.startswith(('/equipe/','/team/')):return 'Publications scientifiques'
    if u.startswith('/services/'):return 'Services et matériel'
    if u.startswith('/applications'):return 'Applications sectorielles'
    if u.startswith(('/a-propos','/about-us')):return 'Entreprise, équipe, partenaires et innovation'
    if u.startswith('/cgvs'):return 'CGV'
    if u=='/contact':return 'Contact et réservation'
    return 'Accueil / synthèse'

def target_note(p):
    group=family(p)
    return {
      'Travaux scientifiques / études détaillées':'Conserver le détail en page dédiée; ajouter des accès depuis les études et expertises, avec les citations originales.',
      'Publications scientifiques':'Conserver la liste complète; lien depuis le profil de la personne et une éventuelle rubrique Publications.',
      'Services et matériel':'Page complète et résumé court dans les cartes d’expertise; matériel dans une page avec caractéristiques et tarifs publiés.',
      'Applications sectorielles':'Pages sectorielles complètes, accessibles depuis l’atlas; préserver les liens vers les services associés.',
      'Entreprise, équipe, partenaires et innovation':'Résumé dans les sections d’accueil; conserver les biographies, groupes de références et projets détaillés.',
      'CGV':'Page dédiée reliée au pied de page; copie source inchangée à transmettre au client pour actualisation éventuelle.',
      'Contact et réservation':'Formulaire et coordonnées en HTML; rebrancher un envoi réel et le lien de réservation retenu.',
      'Accueil / synthèse':'Synthèse interactive et accès aux pages complètes; isoler l’actualité datée du contenu permanent.'
    }[group]

def main():
    bundle=json.loads((ROOT/'data/pages.json').read_text())
    assets=json.loads((ROOT/'data/assets.json').read_text())['assets']
    asset_by_url={a['url']:a for a in assets}
    valid=[p for p in bundle['pages'] if p.get('status')==200]
    distinct=[p for p in valid if urlsplit(p['requested_url']).path!='/Services']
    status_by_url={norm(p['requested_url']):p.get('status') for p in bundle['pages']}
    content=[];inventory=[]
    for p in distinct:
        doc=LH.fromstring((ROOT/p['raw_html_path']).read_bytes())
        lines=doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," headline ")]')
        blocks=[]
        for line in lines:
            if 'header' in line.get('class','').split():continue
            if any(h.text_content().strip().casefold() in ['liens rapides','quick links','links'] for h in line.xpath('.//h3')):continue
            for plugin in line.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," portlet ")]'):
                text=plugin.text_content().strip()
                heads=[{'level':int(h.tag[1]),'text':h.text_content().strip()} for h in plugin.xpath('.//h1|.//h2|.//h3|.//h4') if h.text_content().strip()]
                imgs=[]
                for im in plugin.xpath('.//img[@src]'):
                    src=urljoin(p['final_url'],im.get('src'))
                    imgs.append({'source_url':src,'alt':im.get('alt',''),'local_path':asset_by_url.get(src,{}).get('local_path')})
                links=[{'url':urljoin(p['final_url'],a.get('href')),'text':a.text_content().strip()} for a in plugin.xpath('.//a[@href]') if not a.get('href').startswith('javascript:')]
                if text or imgs or heads:
                    blocks.append({'type':'heading' if heads else 'image' if imgs and not text else 'content',
                                   'headings':heads,'text':text,'images':imgs,'links':links})
        rec={'source_url':p['requested_url'],'final_url':p['final_url'],'language':p['language'],
             'retrieved_at':p['retrieved_at'],'original_title':p['title'],'original_description':p['meta'].get('description',''),
             'original_canonical':p.get('canonical_url'),'family':family(p),'source_markdown_path':p['content_path'],
             'source_html_path':p['raw_html_path'],'source_metadata_path':p['metadata_path'],
             'content_markdown':(ROOT/p['content_path']).read_text(),'blocks':blocks,
             'images':p['images'],'links':p['links'],'forms':p['forms']}
        content.append(rec)
        inventory.append({'source_url':p['requested_url'],'language':p['language'],'status':p['status'],'title':p['title'],
                          'family':family(p),'suggested_target_path':urlsplit(p['requested_url']).path,
                          'migration_action':'preserve_url_by_default','placement':target_note(p),'source_file':p['content_path'],
                          'description':p['meta'].get('description','')})
    dump(ROOT/'data/content.json',{'status':'source_snapshot_not_rewritten','pages':content})
    csv_write(ROOT/'inventory-pages.csv',inventory,list(inventory[0]))
    asset_rows=[{'source_url':a['url'],'local_path':a.get('local_path',''),'kind':a['kind'],'status':a.get('status'),
                 'width':a.get('width'),'height':a.get('height'),'bytes':a.get('bytes'),
                 'alt_texts':' | '.join(a.get('alt_texts',[])),'used_on':' | '.join(a.get('used_on',[])),'sha256':a.get('sha256','')} for a in assets]
    csv_write(ROOT/'inventory-assets.csv',asset_rows,list(asset_rows[0]))
    links={}
    for p in distinct:
        text_urls=re.findall(r'https?://[^\s<>"\)]+',p.get('body_text',''))
        for l in p['links']+[{'url':u,'text':''} for u in text_urls]:
            u=l['url']
            if u.startswith(('javascript:','#')):continue
            r=links.setdefault(u,{'url':u,'source_pages':[],'link_texts':[],'http_status_checked':status_by_url.get(norm(u)) if urlsplit(u).hostname in ['www.ldgenx.fr','www.ldgenx.com'] else None})
            for key,value in [('source_pages',p['requested_url']),('link_texts',l['text'])]:
                if value and value not in r[key]:r[key].append(value)
    dump(ROOT/'data/links.json',{'note':'External references are preserved, not all fetched or tested. Internal page statuses were checked.','links':sorted(links.values(),key=lambda r:r['url'])})
    broken=[]
    for p in bundle['pages']:
        if p.get('status')==200:continue
        path=urlsplit(p['requested_url']).path;lang='fr' if '.fr' in p['requested_url'] else 'en'
        proposed='/services' if path.endswith('/Services') else ('/a-propos/partenaires' if lang=='fr' else '/about-us/partners') if path in ['/partenaires-2','/partners'] else '/about-us' if path=='/a-propos' and lang=='en' else ''
        sources=sorted({s for r in links.values() if norm(r['url'])==norm(p['requested_url']) for s in r['source_pages']})
        broken.append({'old_url':p['requested_url'],'status':p.get('status'),'suggested_target_path':proposed,
                       'action':'review_and_fix_links_or_add_relevant_redirect','linked_from':' | '.join(sources)})
    csv_write(ROOT/'broken-links.csv',broken,list(broken[0]))
    redirects=[{'old_url':p['requested_url'],'target_path':'/services','action':'301_alias','status':'draft_not_deployed'} for p in valid if urlsplit(p['requested_url']).path=='/Services']
    redirects += [{'old_url':r['old_url'],'target_path':r['suggested_target_path'],'action':'review_then_301_if_relevant','status':'draft_not_deployed'} for r in broken]
    csv_write(ROOT/'redirects-draft.csv',redirects,list(redirects[0]))
    pairs=[{'fr':'https://www.ldgenx.fr'+fr,'en':'https://www.ldgenx.com'+en,'status':'observed_page_pair'} for fr,en in LANGUAGE_PAIRS]
    dump(ROOT/'data/language-pairs.json',{'pairs':pairs,'unpaired_fr':['https://www.ldgenx.fr/cgvs/cgvs'],'note':'Pairing is a migration proposal based on matching page topics; no hreflang has been deployed.'})
    pubs=[]
    for person,slug in [('Maeva Leitwein','equipe__dr-maeva-leitwein'),('Emilie Delpuech','equipe__dr-emilie-delpuech')]:
        year=None
        for line in (ROOT/'source/fr'/(slug+'.md')).read_text().splitlines():
            y=re.fullmatch(r'\*\*(20\d\d)\*\*',line.strip())
            if y:year=int(y.group(1))
            elif line.startswith('- ') and year:
                pubs.append({'person':person,'display_year':year,'citation_markdown_as_published':line[2:],
                             'urls':list(dict.fromkeys(re.findall(r'https?://[^\s\)]+',line))),'source_url':'https://www.ldgenx.fr/'+slug.replace('__','/'),
                             'status':'as_published_on_website_not_revalidated_with_publisher'})
    dump(ROOT/'data/publications.json',{'publications':pubs,'note':'Preserve preprint/submitted labels and authorship; website lists stop at 2022 and may need client updates.'})
    partner_page=next(p for p in distinct if p['requested_url']=='https://www.ldgenx.fr/a-propos/partenaires')
    source=(ROOT/partner_page['content_path']).read_text()
    partners=[];group=None
    for line in source.splitlines():
        if line.startswith('# '):group=line[2:]
        m=re.match(r'!\[([^\]]*)\]\(([^)]+)\)',line)
        if m and group in ['Les instituts de recherche publique','Nous sommes soutenues et accompagnées','Ils nous font confiance']:
            alt,url=m.groups(); a=asset_by_url.get(url,{})
            partners.append({'source_group':group,'source_alt':alt,'display_name':'CNRS' if alt=='cbrs' else alt,
                             'image_url':url,'local_image_path':a.get('local_path'),'source_url':partner_page['requested_url']})
    dump(ROOT/'data/partners.json',{'partners':partners,'note':'Keep published categories and their descriptions; public-institute section describes founders’ training/research careers.'})
    price_specs=[('Pompe triple modèle 1',1900,'c89adf8d8398__default-6a4e5f94c9b24-site-web-ldgenx-44.png'),
                 ('Pompe triple modèle 2',2100,'c89adf8d8398__default-6a4e5f94c9b24-site-web-ldgenx-44.png'),
                 ('Capsules + tampon de préservation',40,'c89adf8d8398__default-6a4e5f94c9b24-site-web-ldgenx-44.png'),
                 ('Stickpump',1270,'77af31dc88f8__default-6a4e5faed8f0e-site-web-ldgenx-45.png'),
                 ('Filtres (carte Stickpump)',18,'77af31dc88f8__default-6a4e5faed8f0e-site-web-ldgenx-45.png'),
                 ('Torpille',1400,'c64a3ed24807__default-6a4e603cb9218-site-web-ldgenx-46.png')]
    prices=[]
    for item,amount,filename in price_specs:
        local='assets/images/'+filename
        asset=next(a for a in assets if a.get('local_path')==local)
        prices.append({'item_as_published':item,'amount':amount,'currency':'EUR','tax_basis_as_published':'HT',
                       'source_asset_path':local,'source_asset_url':asset['url'],'source_page':'https://www.ldgenx.fr/services/materiel',
                       'verification':'visually_checked_transcription_of_published_image','current_commercial_validity':'client_to_confirm'})
    dump(ROOT/'data/verified-image-price-transcriptions.json',{'prices':prices,'note':'These transcribe currently published images, not a quote or a promise of current availability. The Torpille card is cropped at the bottom; no complete second line has been inferred.'})
    for lang in ['fr','en']:
        chunks=['# LDgenX — Contenus sources '+lang.upper()+'\n\nCollecte du 13 octobre 2026. Texte source, sans réécriture scientifique. Images et liens originaux conservés.\n']
        for p in distinct:
            if p['language']==lang:
                chunks.append('\n\n---\n\n## Source : '+p['requested_url']+'\n\n'+(ROOT/p['content_path']).read_text())
        (ROOT/('CONTENUS_'+lang.upper()+'.md')).write_text(''.join(chunks),encoding='utf-8')
    stats={'content_pages':len(distinct),'french_pages':sum(p['language']=='fr' for p in distinct),
           'english_pages':sum(p['language']=='en' for p in distinct),'checked_page_urls':len(bundle['pages']),
           'http_200_urls':len(valid),'duplicate_services_aliases':len(valid)-len(distinct),'broken_page_urls':len(broken),
           'published_asset_urls':len(assets),'unique_published_assets':len({a['local_path'] for a in assets if a.get('local_path')}),
           'failed_published_assets':sum(not a.get('local_path') for a in assets),'publication_entries_fr':len(pubs),
           'published_partner_logos':len(partners),'external_original_pdfs':2,'collected_at':bundle['collected_at']}
    dump(ROOT/'data/coverage.json',stats)
    coverage_table='\n## Couverture\n\n| Élément | Nombre |\n|---|---|\n'
    for label,key in [('Pages distinctes','content_pages'),('Pages françaises','french_pages'),('Pages anglaises','english_pages'),('URL de pages contrôlées','checked_page_urls'),('Liens de pages cassés','broken_page_urls'),('Fichiers image distincts','unique_published_assets'),('Adresses d’images publiées','published_asset_urls'),('Références scientifiques FR','publication_entries_fr'),('Logos de la page Partenaires','published_partner_logos'),('PDF originaux complémentaires','external_original_pdfs')]:
        coverage_table+='| '+label+' | '+str(stats[key])+' |\n'
    report=['# LDgenX — Inventaire de migration\n\nCollecte publique du 13 octobre 2026.\n',
            coverage_table,
            '\n## Pages à préserver\n\n| Langue | Page source | Destination du contenu |\n|---|---|---|\n']
    for r in inventory:report.append('| '+r['language'].upper()+' | ['+(r['title'] or r['source_url']).replace('|','/')+']('+r['source_url']+') | '+r['family']+' |\n')
    report.append('\n## Liens de pages actuellement cassés\n\n| Ancienne URL | Proposition à vérifier |\n|---|---|\n')
    for r in broken:report.append('| '+r['old_url']+' | '+r['suggested_target_path']+' |\n')
    report.append('\n## Sources complémentaires Artois-Picardie\n\nLe lien publié sur la page ADNe mène à un article de l’Agence de l’eau daté du 6 août 2026, avec deux PDF originaux archivés. Ces documents sont des sources complémentaires, non comptées dans les 49 pages LDgenX.\n\n- [Article de l’Agence de l’eau](https://www.eau-artois-picardie.fr/etude-de-la-biodiversite-de-lichtyofaune-dans-les-estuaires-et-les-ports-avec-ladn-environnemental)\n- [Rapport final](assets/documents/rapport_final_adne_estuaires_et_ports_aeap_0.pdf)\n- [Présentation de restitution](assets/documents/presentation_reunion_de_restitution_adne_estuaires_et_ports_aeap_30062026_0.pdf)\n')
    (ROOT/'INVENTAIRE.md').write_text(''.join(report),encoding='utf-8')
    print(json.dumps(stats,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
