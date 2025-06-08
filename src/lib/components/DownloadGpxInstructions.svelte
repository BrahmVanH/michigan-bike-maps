<script lang="ts">
	import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet/';
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '@/components/ui/accordion/';
	import Icon from '@iconify/svelte';

	import { cn } from '@/utils';
	import config from '@/config/instructions';
	import type { s3Obj } from '@/types';
	import FullScreenImgWrapper from './FullScreenImgWrapper.svelte';

	interface Props {
		className?: string;
		s3Imgs: s3Obj[];
	}

	let { className, s3Imgs }: Props = $props();

	function getS3ImgGroupsRecord(s3Imgs: s3Obj[]) {
		if (!s3Imgs) return;
		let r: Record<string, string[]> = {};

		s3Imgs.forEach((img) => {
			const imgGroupKey = img.key?.split('/')[1].split('-').slice(0, 2).join('-');
			if (!imgGroupKey) return;
			if (r[imgGroupKey]) {
				r[imgGroupKey].push(img.url);
			} else {
				r[imgGroupKey] = [img.url];
			}
		});


		return r;
	}

	const { sources } = config;
	const imgs = $derived(getS3ImgGroupsRecord(s3Imgs));

</script>

<Sheet>
	<SheetTrigger
		class={cn([
			' flex  items-center text-white underline hover:text-orange-300 focus:ring-2 focus:ring-orange-500/50 focus:outline-none ',
			className
		])}
		><p class="mr-2">How to get GPX file</p>
		<Icon icon="lucide:message-circle-question" />
	</SheetTrigger>
	<SheetContent
		side="right"
		class="flex flex-col justify-center border border-orange-700/30 bg-black/30 p-6 text-white shadow-xl backdrop-blur-sm overflow-y-scroll"
	>
		<div class="flex h-full w-full flex-col">
			<Accordion type="multiple">
				{#each sources as source}
					<AccordionItem value={source.id}>
						<AccordionTrigger class="border border-white text-xl px-4 py-3">{source.title}</AccordionTrigger
						>
						<AccordionContent>
							<ol>
								{#each source.downloadSteps as step, index}
									<li class="flex flex-col space-y-8">
										{#if imgs && imgs[source.id][index] }
											<FullScreenImgWrapper className="lg:max-w-[300px] w-full">

												<img
												class="lg:max-w-[600px] w-full lg:w-full"
												src={imgs[source.id][index] ?? ""}
												alt={`screenshot of current instruction step in ${source.id.split('-').join(' ')} setting`}
											  loading="lazy"
												/>
											</FullScreenImgWrapper>
										{/if}
										<p class="">{step.text}</p>
									</li>
								{/each}
							</ol>
						</AccordionContent>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	</SheetContent>
</Sheet>
